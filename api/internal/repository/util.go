package repository

import (
	"fmt"
	"reflect"
)

func GatherFields(intf interface{}, init int, argsInit []interface{}) (string, []interface{}) {
	fields := reflect.ValueOf(intf).Elem()
	args := argsInit
	qtext := ""
	idx := init

	for i := 0; i < fields.NumField(); i++ {
		if !fields.Field(i).IsNil() {
			if idx != init {
				qtext += ", "
			}
			args = append(args, fields.Field(i).Interface())
			jsonFieldName := fields.Type().Field(i).Tag.Get("json")
			qtext += fmt.Sprintf("%s = $%d", jsonFieldName, idx)
			idx++
		}
		fmt.Printf("%s\n", qtext)
	}

	return qtext, args
}
