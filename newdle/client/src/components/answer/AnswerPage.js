import {Grid, Checkbox, Header} from 'semantic-ui-react';
import React from 'react';
import MonthCalendar from './MonthCalendar';
import Calendar from './Calendar';
import {getNumberOfTimeslots, getNumberOfAvailableAnswers} from '../../selectors';
import {useSelector} from 'react-redux';
import styles from './answer.module.scss';

export default function AnswerPage() {
  const numberOfTimeslots = useSelector(getNumberOfTimeslots);
  const numberOfAvailable = useSelector(getNumberOfAvailableAnswers);

  return (
    <div>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <MonthCalendar />
            <Header as="h3" className={styles['options-msg']}>
              {numberOfAvailable} out of {numberOfTimeslots} options chosen
            </Header>
            <Checkbox toggle label="Accept all options where I'm available" />
          </Grid.Column>
          <Grid.Column width={11}>
            <Calendar />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}
