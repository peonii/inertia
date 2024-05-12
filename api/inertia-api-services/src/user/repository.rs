use async_trait::async_trait;
use inertia_api_domain::user::{repository::UserRepository, UserCreateDto, UserDto};
use scylla::IntoTypedRows;
use snowflake::SnowflakeIdBucket;

use crate::snowflakes::USER_NODE_ID;

pub struct ScyllaUserRepository {
    pub session: scylla::Session,
    machine_id: i32
}

impl ScyllaUserRepository {
    pub fn new(session: scylla::Session, machine_id: i32) -> Self {
        Self {
            session,
            machine_id
        }
    }
}

#[async_trait]
impl UserRepository for ScyllaUserRepository {
    async fn find_one(&self, id: i64) -> anyhow::Result<UserDto> {
        let query = format!("
            SELECT
                id, name, image, auth_role, created_at
            FROM
                inertia.users
            WHERE
                id = ?
        ");

        let prepared = self.session.prepare(query).await?;

        if let Some(rows) = self.session.execute(&prepared, (id,)).await?.rows {
            let row = rows.into_typed::<UserDto>().next();
            if row.is_none() {
                return Err(anyhow::anyhow!("User not found"));
            }

            let row = row.unwrap();

            return row.map_err(|err| anyhow::anyhow!(err));
        } else {
            return Err(anyhow::anyhow!("User not found"));
        }
    }

    async fn create(&self, user: UserCreateDto) -> anyhow::Result<UserDto> {
        let query = format!("
            INSERT INTO
                inertia.users (id, name, image, auth_role, created_at)
            VALUES
                (?, ?, ?, ?, ?)
            IF NOT EXISTS
        ");

        let prepared = self.session.prepare(query).await?;

        let mut snowflake = SnowflakeIdBucket::new(self.machine_id, USER_NODE_ID);
        let id = snowflake.get_id();

        let user_dto = UserDto {
            id,
            name: user.name,
            image: user.image,
            auth_role: user.auth_role,
            created_at: time::OffsetDateTime::now_utc(),
        };
        let user_dto_resp = user_dto.clone();

        self.session.execute(&prepared, (
            user_dto.id,
            user_dto.name,
            user_dto.image,
            user_dto.auth_role,
            user_dto.created_at,
        )).await?;

        return Ok(user_dto_resp);
    }
}