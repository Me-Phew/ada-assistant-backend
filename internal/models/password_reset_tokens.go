// Code generated by SQLBoiler 4.3.1 (https://github.com/volatiletech/sqlboiler). DO NOT EDIT.
// This file is meant to be re-generated in place and/or deleted at any time.

package models

import (
	"context"
	"database/sql"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/friendsofgo/errors"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
	"github.com/volatiletech/sqlboiler/v4/queries/qmhelper"
	"github.com/volatiletech/strmangle"
)

// PasswordResetToken is an object representing the database table.
type PasswordResetToken struct {
	Token      string    `boil:"token" json:"token" toml:"token" yaml:"token"`
	ValidUntil time.Time `boil:"valid_until" json:"valid_until" toml:"valid_until" yaml:"valid_until"`
	UserID     string    `boil:"user_id" json:"user_id" toml:"user_id" yaml:"user_id"`
	CreatedAt  time.Time `boil:"created_at" json:"created_at" toml:"created_at" yaml:"created_at"`
	UpdatedAt  time.Time `boil:"updated_at" json:"updated_at" toml:"updated_at" yaml:"updated_at"`

	R *passwordResetTokenR `boil:"-" json:"-" toml:"-" yaml:"-"`
	L passwordResetTokenL  `boil:"-" json:"-" toml:"-" yaml:"-"`
}

var PasswordResetTokenColumns = struct {
	Token      string
	ValidUntil string
	UserID     string
	CreatedAt  string
	UpdatedAt  string
}{
	Token:      "token",
	ValidUntil: "valid_until",
	UserID:     "user_id",
	CreatedAt:  "created_at",
	UpdatedAt:  "updated_at",
}

// Generated where

var PasswordResetTokenWhere = struct {
	Token      whereHelperstring
	ValidUntil whereHelpertime_Time
	UserID     whereHelperstring
	CreatedAt  whereHelpertime_Time
	UpdatedAt  whereHelpertime_Time
}{
	Token:      whereHelperstring{field: "\"password_reset_tokens\".\"token\""},
	ValidUntil: whereHelpertime_Time{field: "\"password_reset_tokens\".\"valid_until\""},
	UserID:     whereHelperstring{field: "\"password_reset_tokens\".\"user_id\""},
	CreatedAt:  whereHelpertime_Time{field: "\"password_reset_tokens\".\"created_at\""},
	UpdatedAt:  whereHelpertime_Time{field: "\"password_reset_tokens\".\"updated_at\""},
}

// PasswordResetTokenRels is where relationship names are stored.
var PasswordResetTokenRels = struct {
	User string
}{
	User: "User",
}

// passwordResetTokenR is where relationships are stored.
type passwordResetTokenR struct {
	User *User `boil:"User" json:"User" toml:"User" yaml:"User"`
}

// NewStruct creates a new relationship struct
func (*passwordResetTokenR) NewStruct() *passwordResetTokenR {
	return &passwordResetTokenR{}
}

// passwordResetTokenL is where Load methods for each relationship are stored.
type passwordResetTokenL struct{}

var (
	passwordResetTokenAllColumns            = []string{"token", "valid_until", "user_id", "created_at", "updated_at"}
	passwordResetTokenColumnsWithoutDefault = []string{"valid_until", "user_id", "created_at", "updated_at"}
	passwordResetTokenColumnsWithDefault    = []string{"token"}
	passwordResetTokenPrimaryKeyColumns     = []string{"token"}
)

type (
	// PasswordResetTokenSlice is an alias for a slice of pointers to PasswordResetToken.
	// This should generally be used opposed to []PasswordResetToken.
	PasswordResetTokenSlice []*PasswordResetToken

	passwordResetTokenQuery struct {
		*queries.Query
	}
)

// Cache for insert, update and upsert
var (
	passwordResetTokenType                 = reflect.TypeOf(&PasswordResetToken{})
	passwordResetTokenMapping              = queries.MakeStructMapping(passwordResetTokenType)
	passwordResetTokenPrimaryKeyMapping, _ = queries.BindMapping(passwordResetTokenType, passwordResetTokenMapping, passwordResetTokenPrimaryKeyColumns)
	passwordResetTokenInsertCacheMut       sync.RWMutex
	passwordResetTokenInsertCache          = make(map[string]insertCache)
	passwordResetTokenUpdateCacheMut       sync.RWMutex
	passwordResetTokenUpdateCache          = make(map[string]updateCache)
	passwordResetTokenUpsertCacheMut       sync.RWMutex
	passwordResetTokenUpsertCache          = make(map[string]insertCache)
)

var (
	// Force time package dependency for automated UpdatedAt/CreatedAt.
	_ = time.Second
	// Force qmhelper dependency for where clause generation (which doesn't
	// always happen)
	_ = qmhelper.Where
)

// One returns a single passwordResetToken record from the query.
func (q passwordResetTokenQuery) One(ctx context.Context, exec boil.ContextExecutor) (*PasswordResetToken, error) {
	o := &PasswordResetToken{}

	queries.SetLimit(q.Query, 1)

	err := q.Bind(ctx, exec, o)
	if err != nil {
		if errors.Cause(err) == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		return nil, errors.Wrap(err, "models: failed to execute a one query for password_reset_tokens")
	}

	return o, nil
}

// All returns all PasswordResetToken records from the query.
func (q passwordResetTokenQuery) All(ctx context.Context, exec boil.ContextExecutor) (PasswordResetTokenSlice, error) {
	var o []*PasswordResetToken

	err := q.Bind(ctx, exec, &o)
	if err != nil {
		return nil, errors.Wrap(err, "models: failed to assign all query results to PasswordResetToken slice")
	}

	return o, nil
}

// Count returns the count of all PasswordResetToken records in the query.
func (q passwordResetTokenQuery) Count(ctx context.Context, exec boil.ContextExecutor) (int64, error) {
	var count int64

	queries.SetSelect(q.Query, nil)
	queries.SetCount(q.Query)

	err := q.Query.QueryRowContext(ctx, exec).Scan(&count)
	if err != nil {
		return 0, errors.Wrap(err, "models: failed to count password_reset_tokens rows")
	}

	return count, nil
}

// Exists checks if the row exists in the table.
func (q passwordResetTokenQuery) Exists(ctx context.Context, exec boil.ContextExecutor) (bool, error) {
	var count int64

	queries.SetSelect(q.Query, nil)
	queries.SetCount(q.Query)
	queries.SetLimit(q.Query, 1)

	err := q.Query.QueryRowContext(ctx, exec).Scan(&count)
	if err != nil {
		return false, errors.Wrap(err, "models: failed to check if password_reset_tokens exists")
	}

	return count > 0, nil
}

// User pointed to by the foreign key.
func (o *PasswordResetToken) User(mods ...qm.QueryMod) userQuery {
	queryMods := []qm.QueryMod{
		qm.Where("\"id\" = ?", o.UserID),
	}

	queryMods = append(queryMods, mods...)

	query := Users(queryMods...)
	queries.SetFrom(query.Query, "\"users\"")

	return query
}

// LoadUser allows an eager lookup of values, cached into the
// loaded structs of the objects. This is for an N-1 relationship.
func (passwordResetTokenL) LoadUser(ctx context.Context, e boil.ContextExecutor, singular bool, maybePasswordResetToken interface{}, mods queries.Applicator) error {
	var slice []*PasswordResetToken
	var object *PasswordResetToken

	if singular {
		object = maybePasswordResetToken.(*PasswordResetToken)
	} else {
		slice = *maybePasswordResetToken.(*[]*PasswordResetToken)
	}

	args := make([]interface{}, 0, 1)
	if singular {
		if object.R == nil {
			object.R = &passwordResetTokenR{}
		}
		args = append(args, object.UserID)

	} else {
	Outer:
		for _, obj := range slice {
			if obj.R == nil {
				obj.R = &passwordResetTokenR{}
			}

			for _, a := range args {
				if a == obj.UserID {
					continue Outer
				}
			}

			args = append(args, obj.UserID)

		}
	}

	if len(args) == 0 {
		return nil
	}

	query := NewQuery(
		qm.From(`users`),
		qm.WhereIn(`users.id in ?`, args...),
	)
	if mods != nil {
		mods.Apply(query)
	}

	results, err := query.QueryContext(ctx, e)
	if err != nil {
		return errors.Wrap(err, "failed to eager load User")
	}

	var resultSlice []*User
	if err = queries.Bind(results, &resultSlice); err != nil {
		return errors.Wrap(err, "failed to bind eager loaded slice User")
	}

	if err = results.Close(); err != nil {
		return errors.Wrap(err, "failed to close results of eager load for users")
	}
	if err = results.Err(); err != nil {
		return errors.Wrap(err, "error occurred during iteration of eager loaded relations for users")
	}

	if len(resultSlice) == 0 {
		return nil
	}

	if singular {
		foreign := resultSlice[0]
		object.R.User = foreign
		if foreign.R == nil {
			foreign.R = &userR{}
		}
		foreign.R.PasswordResetTokens = append(foreign.R.PasswordResetTokens, object)
		return nil
	}

	for _, local := range slice {
		for _, foreign := range resultSlice {
			if local.UserID == foreign.ID {
				local.R.User = foreign
				if foreign.R == nil {
					foreign.R = &userR{}
				}
				foreign.R.PasswordResetTokens = append(foreign.R.PasswordResetTokens, local)
				break
			}
		}
	}

	return nil
}

// SetUser of the passwordResetToken to the related item.
// Sets o.R.User to related.
// Adds o to related.R.PasswordResetTokens.
func (o *PasswordResetToken) SetUser(ctx context.Context, exec boil.ContextExecutor, insert bool, related *User) error {
	var err error
	if insert {
		if err = related.Insert(ctx, exec, boil.Infer()); err != nil {
			return errors.Wrap(err, "failed to insert into foreign table")
		}
	}

	updateQuery := fmt.Sprintf(
		"UPDATE \"password_reset_tokens\" SET %s WHERE %s",
		strmangle.SetParamNames("\"", "\"", 1, []string{"user_id"}),
		strmangle.WhereClause("\"", "\"", 2, passwordResetTokenPrimaryKeyColumns),
	)
	values := []interface{}{related.ID, o.Token}

	if boil.IsDebug(ctx) {
		writer := boil.DebugWriterFrom(ctx)
		fmt.Fprintln(writer, updateQuery)
		fmt.Fprintln(writer, values)
	}
	if _, err = exec.ExecContext(ctx, updateQuery, values...); err != nil {
		return errors.Wrap(err, "failed to update local table")
	}

	o.UserID = related.ID
	if o.R == nil {
		o.R = &passwordResetTokenR{
			User: related,
		}
	} else {
		o.R.User = related
	}

	if related.R == nil {
		related.R = &userR{
			PasswordResetTokens: PasswordResetTokenSlice{o},
		}
	} else {
		related.R.PasswordResetTokens = append(related.R.PasswordResetTokens, o)
	}

	return nil
}

// PasswordResetTokens retrieves all the records using an executor.
func PasswordResetTokens(mods ...qm.QueryMod) passwordResetTokenQuery {
	mods = append(mods, qm.From("\"password_reset_tokens\""))
	return passwordResetTokenQuery{NewQuery(mods...)}
}

// FindPasswordResetToken retrieves a single record by ID with an executor.
// If selectCols is empty Find will return all columns.
func FindPasswordResetToken(ctx context.Context, exec boil.ContextExecutor, token string, selectCols ...string) (*PasswordResetToken, error) {
	passwordResetTokenObj := &PasswordResetToken{}

	sel := "*"
	if len(selectCols) > 0 {
		sel = strings.Join(strmangle.IdentQuoteSlice(dialect.LQ, dialect.RQ, selectCols), ",")
	}
	query := fmt.Sprintf(
		"select %s from \"password_reset_tokens\" where \"token\"=$1", sel,
	)

	q := queries.Raw(query, token)

	err := q.Bind(ctx, exec, passwordResetTokenObj)
	if err != nil {
		if errors.Cause(err) == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		return nil, errors.Wrap(err, "models: unable to select from password_reset_tokens")
	}

	return passwordResetTokenObj, nil
}

// Insert a single record using an executor.
// See boil.Columns.InsertColumnSet documentation to understand column list inference for inserts.
func (o *PasswordResetToken) Insert(ctx context.Context, exec boil.ContextExecutor, columns boil.Columns) error {
	if o == nil {
		return errors.New("models: no password_reset_tokens provided for insertion")
	}

	var err error
	if !boil.TimestampsAreSkipped(ctx) {
		currTime := time.Now().In(boil.GetLocation())

		if o.CreatedAt.IsZero() {
			o.CreatedAt = currTime
		}
		if o.UpdatedAt.IsZero() {
			o.UpdatedAt = currTime
		}
	}

	nzDefaults := queries.NonZeroDefaultSet(passwordResetTokenColumnsWithDefault, o)

	key := makeCacheKey(columns, nzDefaults)
	passwordResetTokenInsertCacheMut.RLock()
	cache, cached := passwordResetTokenInsertCache[key]
	passwordResetTokenInsertCacheMut.RUnlock()

	if !cached {
		wl, returnColumns := columns.InsertColumnSet(
			passwordResetTokenAllColumns,
			passwordResetTokenColumnsWithDefault,
			passwordResetTokenColumnsWithoutDefault,
			nzDefaults,
		)

		cache.valueMapping, err = queries.BindMapping(passwordResetTokenType, passwordResetTokenMapping, wl)
		if err != nil {
			return err
		}
		cache.retMapping, err = queries.BindMapping(passwordResetTokenType, passwordResetTokenMapping, returnColumns)
		if err != nil {
			return err
		}
		if len(wl) != 0 {
			cache.query = fmt.Sprintf("INSERT INTO \"password_reset_tokens\" (\"%s\") %%sVALUES (%s)%%s", strings.Join(wl, "\",\""), strmangle.Placeholders(dialect.UseIndexPlaceholders, len(wl), 1, 1))
		} else {
			cache.query = "INSERT INTO \"password_reset_tokens\" %sDEFAULT VALUES%s"
		}

		var queryOutput, queryReturning string

		if len(cache.retMapping) != 0 {
			queryReturning = fmt.Sprintf(" RETURNING \"%s\"", strings.Join(returnColumns, "\",\""))
		}

		cache.query = fmt.Sprintf(cache.query, queryOutput, queryReturning)
	}

	value := reflect.Indirect(reflect.ValueOf(o))
	vals := queries.ValuesFromMapping(value, cache.valueMapping)

	if boil.IsDebug(ctx) {
		writer := boil.DebugWriterFrom(ctx)
		fmt.Fprintln(writer, cache.query)
		fmt.Fprintln(writer, vals)
	}

	if len(cache.retMapping) != 0 {
		err = exec.QueryRowContext(ctx, cache.query, vals...).Scan(queries.PtrsFromMapping(value, cache.retMapping)...)
	} else {
		_, err = exec.ExecContext(ctx, cache.query, vals...)
	}

	if err != nil {
		return errors.Wrap(err, "models: unable to insert into password_reset_tokens")
	}

	if !cached {
		passwordResetTokenInsertCacheMut.Lock()
		passwordResetTokenInsertCache[key] = cache
		passwordResetTokenInsertCacheMut.Unlock()
	}

	return nil
}

// Update uses an executor to update the PasswordResetToken.
// See boil.Columns.UpdateColumnSet documentation to understand column list inference for updates.
// Update does not automatically update the record in case of default values. Use .Reload() to refresh the records.
func (o *PasswordResetToken) Update(ctx context.Context, exec boil.ContextExecutor, columns boil.Columns) (int64, error) {
	if !boil.TimestampsAreSkipped(ctx) {
		currTime := time.Now().In(boil.GetLocation())

		o.UpdatedAt = currTime
	}

	var err error
	key := makeCacheKey(columns, nil)
	passwordResetTokenUpdateCacheMut.RLock()
	cache, cached := passwordResetTokenUpdateCache[key]
	passwordResetTokenUpdateCacheMut.RUnlock()

	if !cached {
		wl := columns.UpdateColumnSet(
			passwordResetTokenAllColumns,
			passwordResetTokenPrimaryKeyColumns,
		)

		if !columns.IsWhitelist() {
			wl = strmangle.SetComplement(wl, []string{"created_at"})
		}
		if len(wl) == 0 {
			return 0, errors.New("models: unable to update password_reset_tokens, could not build whitelist")
		}

		cache.query = fmt.Sprintf("UPDATE \"password_reset_tokens\" SET %s WHERE %s",
			strmangle.SetParamNames("\"", "\"", 1, wl),
			strmangle.WhereClause("\"", "\"", len(wl)+1, passwordResetTokenPrimaryKeyColumns),
		)
		cache.valueMapping, err = queries.BindMapping(passwordResetTokenType, passwordResetTokenMapping, append(wl, passwordResetTokenPrimaryKeyColumns...))
		if err != nil {
			return 0, err
		}
	}

	values := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(o)), cache.valueMapping)

	if boil.IsDebug(ctx) {
		writer := boil.DebugWriterFrom(ctx)
		fmt.Fprintln(writer, cache.query)
		fmt.Fprintln(writer, values)
	}
	var result sql.Result
	result, err = exec.ExecContext(ctx, cache.query, values...)
	if err != nil {
		return 0, errors.Wrap(err, "models: unable to update password_reset_tokens row")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "models: failed to get rows affected by update for password_reset_tokens")
	}

	if !cached {
		passwordResetTokenUpdateCacheMut.Lock()
		passwordResetTokenUpdateCache[key] = cache
		passwordResetTokenUpdateCacheMut.Unlock()
	}

	return rowsAff, nil
}

// UpdateAll updates all rows with the specified column values.
func (q passwordResetTokenQuery) UpdateAll(ctx context.Context, exec boil.ContextExecutor, cols M) (int64, error) {
	queries.SetUpdate(q.Query, cols)

	result, err := q.Query.ExecContext(ctx, exec)
	if err != nil {
		return 0, errors.Wrap(err, "models: unable to update all for password_reset_tokens")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "models: unable to retrieve rows affected for password_reset_tokens")
	}

	return rowsAff, nil
}

// UpdateAll updates all rows with the specified column values, using an executor.
func (o PasswordResetTokenSlice) UpdateAll(ctx context.Context, exec boil.ContextExecutor, cols M) (int64, error) {
	ln := int64(len(o))
	if ln == 0 {
		return 0, nil
	}

	if len(cols) == 0 {
		return 0, errors.New("models: update all requires at least one column argument")
	}

	colNames := make([]string, len(cols))
	args := make([]interface{}, len(cols))

	i := 0
	for name, value := range cols {
		colNames[i] = name
		args[i] = value
		i++
	}

	// Append all of the primary key values for each column
	for _, obj := range o {
		pkeyArgs := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(obj)), passwordResetTokenPrimaryKeyMapping)
		args = append(args, pkeyArgs...)
	}

	sql := fmt.Sprintf("UPDATE \"password_reset_tokens\" SET %s WHERE %s",
		strmangle.SetParamNames("\"", "\"", 1, colNames),
		strmangle.WhereClauseRepeated(string(dialect.LQ), string(dialect.RQ), len(colNames)+1, passwordResetTokenPrimaryKeyColumns, len(o)))

	if boil.IsDebug(ctx) {
		writer := boil.DebugWriterFrom(ctx)
		fmt.Fprintln(writer, sql)
		fmt.Fprintln(writer, args...)
	}
	result, err := exec.ExecContext(ctx, sql, args...)
	if err != nil {
		return 0, errors.Wrap(err, "models: unable to update all in passwordResetToken slice")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "models: unable to retrieve rows affected all in update all passwordResetToken")
	}
	return rowsAff, nil
}

// Upsert attempts an insert using an executor, and does an update or ignore on conflict.
// See boil.Columns documentation for how to properly use updateColumns and insertColumns.
func (o *PasswordResetToken) Upsert(ctx context.Context, exec boil.ContextExecutor, updateOnConflict bool, conflictColumns []string, updateColumns, insertColumns boil.Columns) error {
	if o == nil {
		return errors.New("models: no password_reset_tokens provided for upsert")
	}
	if !boil.TimestampsAreSkipped(ctx) {
		currTime := time.Now().In(boil.GetLocation())

		if o.CreatedAt.IsZero() {
			o.CreatedAt = currTime
		}
		o.UpdatedAt = currTime
	}

	nzDefaults := queries.NonZeroDefaultSet(passwordResetTokenColumnsWithDefault, o)

	// Build cache key in-line uglily - mysql vs psql problems
	buf := strmangle.GetBuffer()
	if updateOnConflict {
		buf.WriteByte('t')
	} else {
		buf.WriteByte('f')
	}
	buf.WriteByte('.')
	for _, c := range conflictColumns {
		buf.WriteString(c)
	}
	buf.WriteByte('.')
	buf.WriteString(strconv.Itoa(updateColumns.Kind))
	for _, c := range updateColumns.Cols {
		buf.WriteString(c)
	}
	buf.WriteByte('.')
	buf.WriteString(strconv.Itoa(insertColumns.Kind))
	for _, c := range insertColumns.Cols {
		buf.WriteString(c)
	}
	buf.WriteByte('.')
	for _, c := range nzDefaults {
		buf.WriteString(c)
	}
	key := buf.String()
	strmangle.PutBuffer(buf)

	passwordResetTokenUpsertCacheMut.RLock()
	cache, cached := passwordResetTokenUpsertCache[key]
	passwordResetTokenUpsertCacheMut.RUnlock()

	var err error

	if !cached {
		insert, ret := insertColumns.InsertColumnSet(
			passwordResetTokenAllColumns,
			passwordResetTokenColumnsWithDefault,
			passwordResetTokenColumnsWithoutDefault,
			nzDefaults,
		)
		update := updateColumns.UpdateColumnSet(
			passwordResetTokenAllColumns,
			passwordResetTokenPrimaryKeyColumns,
		)

		if updateOnConflict && len(update) == 0 {
			return errors.New("models: unable to upsert password_reset_tokens, could not build update column list")
		}

		conflict := conflictColumns
		if len(conflict) == 0 {
			conflict = make([]string, len(passwordResetTokenPrimaryKeyColumns))
			copy(conflict, passwordResetTokenPrimaryKeyColumns)
		}
		cache.query = buildUpsertQueryPostgres(dialect, "\"password_reset_tokens\"", updateOnConflict, ret, update, conflict, insert)

		cache.valueMapping, err = queries.BindMapping(passwordResetTokenType, passwordResetTokenMapping, insert)
		if err != nil {
			return err
		}
		if len(ret) != 0 {
			cache.retMapping, err = queries.BindMapping(passwordResetTokenType, passwordResetTokenMapping, ret)
			if err != nil {
				return err
			}
		}
	}

	value := reflect.Indirect(reflect.ValueOf(o))
	vals := queries.ValuesFromMapping(value, cache.valueMapping)
	var returns []interface{}
	if len(cache.retMapping) != 0 {
		returns = queries.PtrsFromMapping(value, cache.retMapping)
	}

	if boil.IsDebug(ctx) {
		writer := boil.DebugWriterFrom(ctx)
		fmt.Fprintln(writer, cache.query)
		fmt.Fprintln(writer, vals)
	}
	if len(cache.retMapping) != 0 {
		err = exec.QueryRowContext(ctx, cache.query, vals...).Scan(returns...)
		if err == sql.ErrNoRows {
			err = nil // Postgres doesn't return anything when there's no update
		}
	} else {
		_, err = exec.ExecContext(ctx, cache.query, vals...)
	}
	if err != nil {
		return errors.Wrap(err, "models: unable to upsert password_reset_tokens")
	}

	if !cached {
		passwordResetTokenUpsertCacheMut.Lock()
		passwordResetTokenUpsertCache[key] = cache
		passwordResetTokenUpsertCacheMut.Unlock()
	}

	return nil
}

// Delete deletes a single PasswordResetToken record with an executor.
// Delete will match against the primary key column to find the record to delete.
func (o *PasswordResetToken) Delete(ctx context.Context, exec boil.ContextExecutor) (int64, error) {
	if o == nil {
		return 0, errors.New("models: no PasswordResetToken provided for delete")
	}

	args := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(o)), passwordResetTokenPrimaryKeyMapping)
	sql := "DELETE FROM \"password_reset_tokens\" WHERE \"token\"=$1"

	if boil.IsDebug(ctx) {
		writer := boil.DebugWriterFrom(ctx)
		fmt.Fprintln(writer, sql)
		fmt.Fprintln(writer, args...)
	}
	result, err := exec.ExecContext(ctx, sql, args...)
	if err != nil {
		return 0, errors.Wrap(err, "models: unable to delete from password_reset_tokens")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "models: failed to get rows affected by delete for password_reset_tokens")
	}

	return rowsAff, nil
}

// DeleteAll deletes all matching rows.
func (q passwordResetTokenQuery) DeleteAll(ctx context.Context, exec boil.ContextExecutor) (int64, error) {
	if q.Query == nil {
		return 0, errors.New("models: no passwordResetTokenQuery provided for delete all")
	}

	queries.SetDelete(q.Query)

	result, err := q.Query.ExecContext(ctx, exec)
	if err != nil {
		return 0, errors.Wrap(err, "models: unable to delete all from password_reset_tokens")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "models: failed to get rows affected by deleteall for password_reset_tokens")
	}

	return rowsAff, nil
}

// DeleteAll deletes all rows in the slice, using an executor.
func (o PasswordResetTokenSlice) DeleteAll(ctx context.Context, exec boil.ContextExecutor) (int64, error) {
	if len(o) == 0 {
		return 0, nil
	}

	var args []interface{}
	for _, obj := range o {
		pkeyArgs := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(obj)), passwordResetTokenPrimaryKeyMapping)
		args = append(args, pkeyArgs...)
	}

	sql := "DELETE FROM \"password_reset_tokens\" WHERE " +
		strmangle.WhereClauseRepeated(string(dialect.LQ), string(dialect.RQ), 1, passwordResetTokenPrimaryKeyColumns, len(o))

	if boil.IsDebug(ctx) {
		writer := boil.DebugWriterFrom(ctx)
		fmt.Fprintln(writer, sql)
		fmt.Fprintln(writer, args)
	}
	result, err := exec.ExecContext(ctx, sql, args...)
	if err != nil {
		return 0, errors.Wrap(err, "models: unable to delete all from passwordResetToken slice")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "models: failed to get rows affected by deleteall for password_reset_tokens")
	}

	return rowsAff, nil
}

// Reload refetches the object from the database
// using the primary keys with an executor.
func (o *PasswordResetToken) Reload(ctx context.Context, exec boil.ContextExecutor) error {
	ret, err := FindPasswordResetToken(ctx, exec, o.Token)
	if err != nil {
		return err
	}

	*o = *ret
	return nil
}

// ReloadAll refetches every row with matching primary key column values
// and overwrites the original object slice with the newly updated slice.
func (o *PasswordResetTokenSlice) ReloadAll(ctx context.Context, exec boil.ContextExecutor) error {
	if o == nil || len(*o) == 0 {
		return nil
	}

	slice := PasswordResetTokenSlice{}
	var args []interface{}
	for _, obj := range *o {
		pkeyArgs := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(obj)), passwordResetTokenPrimaryKeyMapping)
		args = append(args, pkeyArgs...)
	}

	sql := "SELECT \"password_reset_tokens\".* FROM \"password_reset_tokens\" WHERE " +
		strmangle.WhereClauseRepeated(string(dialect.LQ), string(dialect.RQ), 1, passwordResetTokenPrimaryKeyColumns, len(*o))

	q := queries.Raw(sql, args...)

	err := q.Bind(ctx, exec, &slice)
	if err != nil {
		return errors.Wrap(err, "models: unable to reload all in PasswordResetTokenSlice")
	}

	*o = slice

	return nil
}

// PasswordResetTokenExists checks if the PasswordResetToken row exists.
func PasswordResetTokenExists(ctx context.Context, exec boil.ContextExecutor, token string) (bool, error) {
	var exists bool
	sql := "select exists(select 1 from \"password_reset_tokens\" where \"token\"=$1 limit 1)"

	if boil.IsDebug(ctx) {
		writer := boil.DebugWriterFrom(ctx)
		fmt.Fprintln(writer, sql)
		fmt.Fprintln(writer, token)
	}
	row := exec.QueryRowContext(ctx, sql, token)

	err := row.Scan(&exists)
	if err != nil {
		return false, errors.Wrap(err, "models: unable to check if password_reset_tokens exists")
	}

	return exists, nil
}
