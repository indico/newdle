import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {t} from '@lingui/macro';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {Container} from 'semantic-ui-react';
import {setStep} from '../../actions';
import {getStep, getFullTimeslots} from '../../selectors';
import {STEPS} from './steps';
import styles from './CreationHeader.module.scss';

export default function CreationHeader() {
  const steps = [
    {
      title: t`Choose the participants`,
      description: t`You can also "Skip" this step and simply share the link to your newdle`,
    },
    {
      title: t`Choose the time slots`,
      description: t`They will be presented as options to the participants`,
    },
    {
      title: t`Finalize your newdle`,
      description: t`We are almost there!`,
    },
  ];
  const activeStep = useSelector(getStep);
  const slots = useSelector(getFullTimeslots);
  const dispatch = useDispatch();
  const stepMeta = steps[activeStep - 1];

  return (
    <Container>
      <ul className={styles['step-box']}>
        {Object.values(STEPS).map(index => {
          return (
            <Step
              key={index}
              index={index - 1}
              active={index === activeStep}
              // Step 3 (index === 2) should only be clickable if there are already slots defined
              onClick={
                index < STEPS.FINAL || !_.isEmpty(slots)
                  ? () => dispatch(setStep(index))
                  : undefined
              }
            >
              {index}
            </Step>
          );
        })}
      </ul>
      <StepBody title={stepMeta.title} description={stepMeta.description} />
    </Container>
  );
}

function Step({active, children, onClick}) {
  return (
    <li
      className={`${styles.step} ${active ? styles.active : ''} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      {children}
    </li>
  );
}

Step.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

Step.defaultProps = {
  onClick: undefined,
};

function StepBody({title, description}) {
  return (
    <div className={styles['step-body']}>
      <h3>{title}</h3>
      <div className={styles.description}>{description}</div>
    </div>
  );
}

StepBody.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
