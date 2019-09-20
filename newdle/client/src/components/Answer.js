import {Grid, Checkbox, Header} from 'semantic-ui-react';
import React from 'react';
import Calendar from './Calendar';
import AnswerCalendar from './AnswerCalendar';
import styles from './Answer.module.scss';

export default function Answer() {
  return (
    <div>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <Calendar />
            <Header as="h3" className={styles['options-msg']}>
              4 out of 7 options chosen
            </Header>
            <Checkbox toggle label="Accept all options when I'm available" />
          </Grid.Column>
          <Grid.Column width={11}>
            <AnswerCalendar />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}
