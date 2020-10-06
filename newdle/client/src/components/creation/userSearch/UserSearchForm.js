import React from 'react';
import {Form as FinalForm, Field} from 'react-final-form';
import {FORM_ERROR} from 'final-form';
import PropTypes from 'prop-types';
import {Button, Form} from 'semantic-ui-react';
import {Trans, t} from '@lingui/macro';

function validateForm({name, email}) {
  if (!name && !email) {
    return {[FORM_ERROR]: 'Missing search criteria'};
  }
  return {};
}

export default function UserSearchForm({onSearch}) {
  return (
    <FinalForm
      onSubmit={onSearch}
      validate={validateForm}
      subscription={{
        values: true,
        pristine: true,
        submitting: true,
        hasValidationErrors: true,
      }}
      render={fprops => (
        <Form onSubmit={fprops.handleSubmit}>
          <Field
            name="name"
            type="text"
            component={Form.Input}
            label={t`Name`}
            disabled={fprops.submitting}
          />
          <Field
            name="email"
            type="text"
            component={Form.Input}
            label={t`Email address`}
            disabled={fprops.submitting}
          />
          <Button
            type="submit"
            disabled={fprops.pristine || fprops.submitting || fprops.hasValidationErrors}
            loading={fprops.submitting}
          >
            <Trans>Search</Trans>
          </Button>
        </Form>
      )}
    />
  );
}

UserSearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
};
