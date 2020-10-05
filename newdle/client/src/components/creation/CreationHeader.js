import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {Container} from 'semantic-ui-react';
import {setStep} from '../../actions';
import {getStep, getFullTimeslots} from '../../selectors';
import styles from './CreationHeader.module.scss';

export default function CreationHeader() {
  const steps = [
    {
      title: 'Choose the participants',
      description: 'You can also "Skip" this step and simply share the link to your newdle',
    },
    {
      title: 'Choose the time slots',
      description: 'Which will be presented as options to the participants',
    },
    {
      title: 'Finalize your newdle',
      description: 'We are almost there!',
    },
  ];
  const active = useSelector(getStep);
  const slots = useSelector(getFullTimeslots);
  const dispatch = useDispatch();
  const activeStep = steps[active - 1];

  return (
    <Container>
      <ul className={styles['step-box']}>
        {steps.map((__, index) => (
          <Step
            key={index}
            index={index + 1}
            active={index + 1 === active}
            // Step 3 (index === 2) should only be clickable if there are already slots defined
            onClick={
              index !== 2 || !_.isEmpty(slots) ? () => dispatch(setStep(index + 1)) : undefined
            }
          >
            {index + 1}
          </Step>
        ))}
      </ul>
      <StepBody title={activeStep.title} description={activeStep.description} />
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
