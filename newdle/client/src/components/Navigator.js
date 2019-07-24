import React from 'react';
import PropTypes from 'prop-types';
import {Container, Header} from 'semantic-ui-react';
import styles from './Navigator.module.scss';

export default function Navigator({steps, active}) {
  const activeStep = steps[active - 1];

  return (
    <Container>
      {steps.map((step, index) => (
        <Step key={index} active={index + 1 === active}>
          {index + 1}
        </Step>
      ))}
      <StepBody title={activeStep.title} description={activeStep.description} />
    </Container>
  );
}

Navigator.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  active: PropTypes.number.isRequired,
};

function Step({active, children}) {
  return <div className={`${styles.step} ${active ? styles.active : ''}`}>{children}</div>;
}

Step.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

function StepBody({title, description}) {
  return (
    <div className={styles['step-body']}>
      <Header className={styles['title']}>{title}</Header>
      <div className={styles['description']}>{description}</div>
    </div>
  );
}

StepBody.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
