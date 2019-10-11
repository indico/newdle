import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Checkbox, Grid, Input, Segment} from 'semantic-ui-react';
import MonthCalendar from './MonthCalendar';
import Calendar from './Calendar';
import {
  getNewdle,
  getNumberOfAvailableAnswers,
  getNumberOfTimeslots,
  isAllAvailableSelected,
  isAllAvailableSelectedImplicitly,
} from '../../answerSelectors';
import {chooseAllAvailable} from '../../actions';
import styles from './answer.module.scss';

export default function AnswerPage({match: {params}}) {
  const dispatch = useDispatch();
  const participantCode = params.partcode;
  const newdle = useSelector(getNewdle);
  const numberOfTimeslots = useSelector(getNumberOfTimeslots);
  const numberOfAvailable = useSelector(getNumberOfAvailableAnswers);
  const allAvailableSelected = useSelector(isAllAvailableSelected);
  const allAvailableDisabled = useSelector(isAllAvailableSelectedImplicitly);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');

  const canSubmit = name.length >= 2 && !submitting && numberOfAvailable > 0;

  function answerNewdle() {
    setSubmitting(true);
  }

  if (!newdle) {
    return null;
  }

  return (
    <div>
      <Grid container>
        {!participantCode && (
          <Grid.Row>
            <div className={styles['participant-name-box']}>
              <h3>Who are you?</h3>
              <Input
                autoFocus
                transparent
                className={styles['participant-name-input']}
                placeholder="Please enter your name..."
                disabled={submitting}
                onChange={(_, data) => setName(data.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && canSubmit) {
                    answerNewdle();
                  }
                }}
              />
            </div>
          </Grid.Row>
        )}
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <MonthCalendar />
            <Segment attached="bottom" secondary>
              <Checkbox
                toggle
                label="Accept all options where I'm available"
                disabled={allAvailableDisabled}
                checked={allAvailableSelected}
                onChange={(_, {checked}) => dispatch(chooseAllAvailable(checked))}
              />
            </Segment>
          </Grid.Column>
          <Grid.Column width={11}>
            <Calendar getAvailability={!!participantCode} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className={styles['bottom-row']}>
          <span className={`${styles['options-msg']} ${numberOfAvailable ? '' : 'none'}`}>
            {numberOfAvailable ? (
              <>
                {numberOfAvailable} out of {numberOfTimeslots} options chosen
              </>
            ) : (
              <em>No options chosen</em>
            )}
          </span>
          <Button
            size="large"
            color="violet"
            content="Send you answer"
            disabled={submitting || !canSubmit}
            loading={submitting}
            icon="send"
            onClick={() => {
              if (canSubmit) {
                answerNewdle();
              }
            }}
          />
        </Grid.Row>
      </Grid>
    </div>
  );
}

AnswerPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      partcode: PropTypes.string,
    }),
  }).isRequired,
};
