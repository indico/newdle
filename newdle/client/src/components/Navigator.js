import React from 'react';
import PropTypes from 'prop-types';
import {Container} from 'semantic-ui-react';
import {useSelector} from 'react-redux';
import {getStep} from '../selectors';
import styles from './Navigator.module.scss';

export default function Navigator() {
  const steps = [
    {
      title: 'Choose the participants',
      description: 'You can also "Skip" this step and add them later',
    },
    {
      title: 'Choose the time slots',
      description: 'Which will be presented as options to the participants',
    },
    {
      title: 'Finalize your Newdle',
      description: 'We are almost there!',
    },
  ];
  const active = useSelector(getStep);
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
      <h3>{title}</h3>
      <div className={styles['description']}>{description}</div>
    </div>
  );
}

StepBody.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
