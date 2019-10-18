import React from 'react';
import PropTypes from 'prop-types';
import {Container, Label} from 'semantic-ui-react';
import styles from './NewdleTitle.module.scss';

export default function NewdleTitle({title, author, label, finished}) {
  return (
    <Container text className={styles.box}>
      <div className={styles.title}>
        <h1 className={styles.header}>{title}</h1>
        {label && (
          <Label basic color={finished ? 'blue' : 'green'} size="tiny" className={styles.label}>
            {label}
          </Label>
        )}
      </div>
      <div className={styles.subtitle}>by {author}</div>
    </Container>
  );
}

NewdleTitle.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  label: PropTypes.string,
  finished: PropTypes.bool,
};

NewdleTitle.defaultProps = {
  label: null,
  finished: null,
};
