// Code generated by SQLBoiler 4.18.0 (https://github.com/volatiletech/sqlboiler). DO NOT EDIT.
// This file is meant to be re-generated in place and/or deleted at any time.

package models

import (
	"bytes"
	"context"
	"reflect"
	"testing"

	"github.com/volatiletech/randomize"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries"
	"github.com/volatiletech/strmangle"
)

var (
	// Relationships sometimes use the reflection helper queries.Equal/queries.Assign
	// so force a package dependency in case they don't.
	_ = queries.Equal
)

func testRefreshTokens(t *testing.T) {
	t.Parallel()

	query := RefreshTokens()

	if query.Query == nil {
		t.Error("expected a query, got nothing")
	}
}

func testRefreshTokensDelete(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	if rowsAff, err := o.Delete(ctx, tx); err != nil {
		t.Error(err)
	} else if rowsAff != 1 {
		t.Error("should only have deleted one row, but affected:", rowsAff)
	}

	count, err := RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if count != 0 {
		t.Error("want zero records, got:", count)
	}
}

func testRefreshTokensQueryDeleteAll(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	if rowsAff, err := RefreshTokens().DeleteAll(ctx, tx); err != nil {
		t.Error(err)
	} else if rowsAff != 1 {
		t.Error("should only have deleted one row, but affected:", rowsAff)
	}

	count, err := RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if count != 0 {
		t.Error("want zero records, got:", count)
	}
}

func testRefreshTokensSliceDeleteAll(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	slice := RefreshTokenSlice{o}

	if rowsAff, err := slice.DeleteAll(ctx, tx); err != nil {
		t.Error(err)
	} else if rowsAff != 1 {
		t.Error("should only have deleted one row, but affected:", rowsAff)
	}

	count, err := RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if count != 0 {
		t.Error("want zero records, got:", count)
	}
}

func testRefreshTokensExists(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	e, err := RefreshTokenExists(ctx, tx, o.Token)
	if err != nil {
		t.Errorf("Unable to check if RefreshToken exists: %s", err)
	}
	if !e {
		t.Errorf("Expected RefreshTokenExists to return true, but got false.")
	}
}

func testRefreshTokensFind(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	refreshTokenFound, err := FindRefreshToken(ctx, tx, o.Token)
	if err != nil {
		t.Error(err)
	}

	if refreshTokenFound == nil {
		t.Error("want a record, got nil")
	}
}

func testRefreshTokensBind(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	if err = RefreshTokens().Bind(ctx, tx, o); err != nil {
		t.Error(err)
	}
}

func testRefreshTokensOne(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	if x, err := RefreshTokens().One(ctx, tx); err != nil {
		t.Error(err)
	} else if x == nil {
		t.Error("expected to get a non nil record")
	}
}

func testRefreshTokensAll(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	refreshTokenOne := &RefreshToken{}
	refreshTokenTwo := &RefreshToken{}
	if err = randomize.Struct(seed, refreshTokenOne, refreshTokenDBTypes, false, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}
	if err = randomize.Struct(seed, refreshTokenTwo, refreshTokenDBTypes, false, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = refreshTokenOne.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}
	if err = refreshTokenTwo.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	slice, err := RefreshTokens().All(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if len(slice) != 2 {
		t.Error("want 2 records, got:", len(slice))
	}
}

func testRefreshTokensCount(t *testing.T) {
	t.Parallel()

	var err error
	seed := randomize.NewSeed()
	refreshTokenOne := &RefreshToken{}
	refreshTokenTwo := &RefreshToken{}
	if err = randomize.Struct(seed, refreshTokenOne, refreshTokenDBTypes, false, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}
	if err = randomize.Struct(seed, refreshTokenTwo, refreshTokenDBTypes, false, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = refreshTokenOne.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}
	if err = refreshTokenTwo.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	count, err := RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if count != 2 {
		t.Error("want 2 records, got:", count)
	}
}

func testRefreshTokensInsert(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	count, err := RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if count != 1 {
		t.Error("want one record, got:", count)
	}
}

func testRefreshTokensInsertWhitelist(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Whitelist(refreshTokenColumnsWithoutDefault...)); err != nil {
		t.Error(err)
	}

	count, err := RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if count != 1 {
		t.Error("want one record, got:", count)
	}
}

func testRefreshTokenToOneUserUsingUser(t *testing.T) {
	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()

	var local RefreshToken
	var foreign User

	seed := randomize.NewSeed()
	if err := randomize.Struct(seed, &local, refreshTokenDBTypes, false, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}
	if err := randomize.Struct(seed, &foreign, userDBTypes, false, userColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize User struct: %s", err)
	}

	if err := foreign.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Fatal(err)
	}

	local.UserID = foreign.ID
	if err := local.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Fatal(err)
	}

	check, err := local.User().One(ctx, tx)
	if err != nil {
		t.Fatal(err)
	}

	if check.ID != foreign.ID {
		t.Errorf("want: %v, got %v", foreign.ID, check.ID)
	}

	slice := RefreshTokenSlice{&local}
	if err = local.L.LoadUser(ctx, tx, false, (*[]*RefreshToken)(&slice), nil); err != nil {
		t.Fatal(err)
	}
	if local.R.User == nil {
		t.Error("struct should have been eager loaded")
	}

	local.R.User = nil
	if err = local.L.LoadUser(ctx, tx, true, &local, nil); err != nil {
		t.Fatal(err)
	}
	if local.R.User == nil {
		t.Error("struct should have been eager loaded")
	}

}

func testRefreshTokenToOneSetOpUserUsingUser(t *testing.T) {
	var err error

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()

	var a RefreshToken
	var b, c User

	seed := randomize.NewSeed()
	if err = randomize.Struct(seed, &a, refreshTokenDBTypes, false, strmangle.SetComplement(refreshTokenPrimaryKeyColumns, refreshTokenColumnsWithoutDefault)...); err != nil {
		t.Fatal(err)
	}
	if err = randomize.Struct(seed, &b, userDBTypes, false, strmangle.SetComplement(userPrimaryKeyColumns, userColumnsWithoutDefault)...); err != nil {
		t.Fatal(err)
	}
	if err = randomize.Struct(seed, &c, userDBTypes, false, strmangle.SetComplement(userPrimaryKeyColumns, userColumnsWithoutDefault)...); err != nil {
		t.Fatal(err)
	}

	if err := a.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Fatal(err)
	}
	if err = b.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Fatal(err)
	}

	for i, x := range []*User{&b, &c} {
		err = a.SetUser(ctx, tx, i != 0, x)
		if err != nil {
			t.Fatal(err)
		}

		if a.R.User != x {
			t.Error("relationship struct not set to correct value")
		}

		if x.R.RefreshTokens[0] != &a {
			t.Error("failed to append to foreign relationship struct")
		}
		if a.UserID != x.ID {
			t.Error("foreign key was wrong value", a.UserID)
		}

		zero := reflect.Zero(reflect.TypeOf(a.UserID))
		reflect.Indirect(reflect.ValueOf(&a.UserID)).Set(zero)

		if err = a.Reload(ctx, tx); err != nil {
			t.Fatal("failed to reload", err)
		}

		if a.UserID != x.ID {
			t.Error("foreign key was wrong value", a.UserID, x.ID)
		}
	}
}

func testRefreshTokensReload(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	if err = o.Reload(ctx, tx); err != nil {
		t.Error(err)
	}
}

func testRefreshTokensReloadAll(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	slice := RefreshTokenSlice{o}

	if err = slice.ReloadAll(ctx, tx); err != nil {
		t.Error(err)
	}
}

func testRefreshTokensSelect(t *testing.T) {
	t.Parallel()

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	slice, err := RefreshTokens().All(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if len(slice) != 1 {
		t.Error("want one record, got:", len(slice))
	}
}

var (
	refreshTokenDBTypes = map[string]string{`Token`: `uuid`, `UserID`: `uuid`, `CreatedAt`: `timestamp with time zone`, `UpdatedAt`: `timestamp with time zone`}
	_                   = bytes.MinRead
)

func testRefreshTokensUpdate(t *testing.T) {
	t.Parallel()

	if 0 == len(refreshTokenPrimaryKeyColumns) {
		t.Skip("Skipping table with no primary key columns")
	}
	if len(refreshTokenAllColumns) == len(refreshTokenPrimaryKeyColumns) {
		t.Skip("Skipping table with only primary key columns")
	}

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	count, err := RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if count != 1 {
		t.Error("want one record, got:", count)
	}

	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenPrimaryKeyColumns...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	if rowsAff, err := o.Update(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	} else if rowsAff != 1 {
		t.Error("should only affect one row but affected", rowsAff)
	}
}

func testRefreshTokensSliceUpdateAll(t *testing.T) {
	t.Parallel()

	if len(refreshTokenAllColumns) == len(refreshTokenPrimaryKeyColumns) {
		t.Skip("Skipping table with only primary key columns")
	}

	seed := randomize.NewSeed()
	var err error
	o := &RefreshToken{}
	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenColumnsWithDefault...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Insert(ctx, tx, boil.Infer()); err != nil {
		t.Error(err)
	}

	count, err := RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}

	if count != 1 {
		t.Error("want one record, got:", count)
	}

	if err = randomize.Struct(seed, o, refreshTokenDBTypes, true, refreshTokenPrimaryKeyColumns...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	// Remove Primary keys and unique columns from what we plan to update
	var fields []string
	if strmangle.StringSliceMatch(refreshTokenAllColumns, refreshTokenPrimaryKeyColumns) {
		fields = refreshTokenAllColumns
	} else {
		fields = strmangle.SetComplement(
			refreshTokenAllColumns,
			refreshTokenPrimaryKeyColumns,
		)
	}

	value := reflect.Indirect(reflect.ValueOf(o))
	typ := reflect.TypeOf(o).Elem()
	n := typ.NumField()

	updateMap := M{}
	for _, col := range fields {
		for i := 0; i < n; i++ {
			f := typ.Field(i)
			if f.Tag.Get("boil") == col {
				updateMap[col] = value.Field(i).Interface()
			}
		}
	}

	slice := RefreshTokenSlice{o}
	if rowsAff, err := slice.UpdateAll(ctx, tx, updateMap); err != nil {
		t.Error(err)
	} else if rowsAff != 1 {
		t.Error("wanted one record updated but got", rowsAff)
	}
}

func testRefreshTokensUpsert(t *testing.T) {
	t.Parallel()

	if len(refreshTokenAllColumns) == len(refreshTokenPrimaryKeyColumns) {
		t.Skip("Skipping table with only primary key columns")
	}

	seed := randomize.NewSeed()
	var err error
	// Attempt the INSERT side of an UPSERT
	o := RefreshToken{}
	if err = randomize.Struct(seed, &o, refreshTokenDBTypes, true); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	ctx := context.Background()
	tx := MustTx(boil.BeginTx(ctx, nil))
	defer func() { _ = tx.Rollback() }()
	if err = o.Upsert(ctx, tx, false, nil, boil.Infer(), boil.Infer()); err != nil {
		t.Errorf("Unable to upsert RefreshToken: %s", err)
	}

	count, err := RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}
	if count != 1 {
		t.Error("want one record, got:", count)
	}

	// Attempt the UPDATE side of an UPSERT
	if err = randomize.Struct(seed, &o, refreshTokenDBTypes, false, refreshTokenPrimaryKeyColumns...); err != nil {
		t.Errorf("Unable to randomize RefreshToken struct: %s", err)
	}

	if err = o.Upsert(ctx, tx, true, nil, boil.Infer(), boil.Infer()); err != nil {
		t.Errorf("Unable to upsert RefreshToken: %s", err)
	}

	count, err = RefreshTokens().Count(ctx, tx)
	if err != nil {
		t.Error(err)
	}
	if count != 1 {
		t.Error("want one record, got:", count)
	}
}
