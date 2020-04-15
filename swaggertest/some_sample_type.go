// Code generated by go-swagger; DO NOT EDIT.

package swaggertest

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"github.com/go-openapi/errors"
	"github.com/go-openapi/strfmt"
	"github.com/go-openapi/swag"
	"github.com/go-openapi/validate"
)

// Validate validates this some sample type
func (m *SomeSampleType) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateData(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateID(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateIsActive(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateMail(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateNum(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *SomeSampleType) validateData(formats strfmt.Registry) error {

	if swag.IsZero(m.Data) { // not required
		return nil
	}

	if err := validate.MinLength("data", "body", string(m.Data), 5); err != nil {
		return err
	}

	if err := validate.MaxLength("data", "body", string(m.Data), 10); err != nil {
		return err
	}

	return nil
}

func (m *SomeSampleType) validateID(formats strfmt.Registry) error {

	if swag.IsZero(m.ID) { // not required
		return nil
	}

	if err := validate.FormatOf("id", "body", "uuid", m.ID.String(), formats); err != nil {
		return err
	}

	return nil
}

func (m *SomeSampleType) validateIsActive(formats strfmt.Registry) error {

	if err := validate.Required("isActive", "body", bool(m.IsActive)); err != nil {
		return err
	}

	return nil
}

func (m *SomeSampleType) validateMail(formats strfmt.Registry) error {

	if swag.IsZero(m.Mail) { // not required
		return nil
	}

	if err := validate.FormatOf("mail", "body", "email", m.Mail.String(), formats); err != nil {
		return err
	}

	return nil
}

func (m *SomeSampleType) validateNum(formats strfmt.Registry) error {

	if swag.IsZero(m.Num) { // not required
		return nil
	}

	if err := validate.MinimumInt("num", "body", int64(m.Num), 1, false); err != nil {
		return err
	}

	if err := validate.MaximumInt("num", "body", int64(m.Num), 100, false); err != nil {
		return err
	}

	return nil
}

// MarshalBinary interface implementation
func (m *SomeSampleType) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *SomeSampleType) UnmarshalBinary(b []byte) error {
	var res SomeSampleType
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}
