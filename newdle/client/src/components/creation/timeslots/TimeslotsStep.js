import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Grid, Icon} from 'semantic-ui-react';
import {getFullTimeslots} from '../../../selectors';
import Calendar from './Calendar';
import Availability from './Availability';
import {setStep} from '../../../actions';
import styles from '../creation.module.scss';

export default function TimeslotsStep() {
  const dispatch = useDispatch();
  const timeslots = useSelector(getFullTimeslots);
  return (
    <div>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <Calendar />
          </Grid.Column>
          <Grid.Column width={11}>
            <Availability />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <div className={styles['button-row']}>
            <Button color="violet" icon labelPosition="left" onClick={() => dispatch(setStep(1))}>
              Back
              <Icon name="angle left" />
            </Button>
            <Button
              color="violet"
              icon
              labelPosition="right"
              disabled={!timeslots.length}
              onClick={() => dispatch(setStep(3))}
            >
              Next step
              <Icon name="angle right" />
            </Button>
          </div>
        </Grid.Row>
      </Grid>
    </div>
  );
}
