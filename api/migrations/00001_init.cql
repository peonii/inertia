CREATE KEYSPACE inertia
  WITH REPLICATION = {
    'class': 'SimpleStrategy', -- We may have to migrate to NetworkTopologyStrategy if scaling up
    'replication_factor': 3
  }
  AND DURABLE_WRITES = true;
