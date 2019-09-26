import {useDispatch} from 'react-redux';
import {fetchNewdle} from '../actions';

import {Grid, Checkbox, Header} from 'semantic-ui-react';
import React from 'react';
import Calendar from './Calendar';
import AnswerCalendar from './AnswerCalendar';
import {getNumberOfTimeslots, getNumberOfAvailableAnswers} from '../selectors';
import {useSelector} from 'react-redux';
import styles from './Answer.module.scss';

export default function Answer() {
  const dispatch = useDispatch();
  dispatch(fetchNewdle('3h24PJkV'));
  const numberOfTimeslots = useSelector(getNumberOfTimeslots);
  const numberOfAvailable = useSelector(getNumberOfAvailableAnswers);
  return (
    <div>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <Calendar />
            <Header as="h3" className={styles['options-msg']}>
              {numberOfAvailable} out of {numberOfTimeslots} options chosen
            </Header>
            <Checkbox toggle label="Accept all options where I'm available" />
          </Grid.Column>
          <Grid.Column width={11}>
            <AnswerCalendar />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}
