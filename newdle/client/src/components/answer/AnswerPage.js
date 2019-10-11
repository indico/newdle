import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Checkbox, Grid, Header} from 'semantic-ui-react';
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

export default function AnswerPage() {
  const dispatch = useDispatch();
  const newdle = useSelector(getNewdle);
  const numberOfTimeslots = useSelector(getNumberOfTimeslots);
  const numberOfAvailable = useSelector(getNumberOfAvailableAnswers);
  const allAvailableSelected = useSelector(isAllAvailableSelected);
  const allAvailableDisabled = useSelector(isAllAvailableSelectedImplicitly);

  if (!newdle) {
    return null;
  }

  return (
    <div>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <MonthCalendar />
            <Header as="h3" className={styles['options-msg']}>
              {numberOfAvailable} out of {numberOfTimeslots} options chosen
            </Header>
            <Checkbox
              toggle
              label="Accept all options where I'm available"
              disabled={allAvailableDisabled}
              checked={allAvailableSelected}
              onChange={(_, {checked}) => dispatch(chooseAllAvailable(checked))}
            />
          </Grid.Column>
          <Grid.Column width={11}>
            <Calendar />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}
