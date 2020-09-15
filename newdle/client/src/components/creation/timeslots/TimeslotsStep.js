import _ from 'lodash';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Grid, Icon, Segment} from 'semantic-ui-react';
import {getFullTimeslots} from '../../../selectors';
import MonthCalendar from './MonthCalendar';
import Availability from './Availability';
import {setStep} from '../../../actions';
import styles from '../creation.module.scss';

function SelectedDates() {
  const slots = useSelector(getFullTimeslots);
  const numSlots = _.size(slots);
  return (
    <Segment
      size="small"
      className={`${styles['selected-dates']} ${numSlots ? styles.active : ''}`}
      attached="bottom"
    >
      {numSlots ? (
        numSlots === 1 ? (
          <span>
            <strong>1</strong> slot added
          </span>
        ) : (
          <span>
            <strong>{numSlots}</strong> slots added
          </span>
        )
      ) : (
        <em>You haven't added any slots yet</em>
      )}
    </Segment>
  );
}

export default function TimeslotsStep() {
  const dispatch = useDispatch();
  const timeslots = useSelector(getFullTimeslots);
  return (
    <div>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid stackable>
            <Grid.Row columns={2}>
              <Grid.Column widescreen={5} computer={6} tablet={8} mobile={12}>
                  <MonthCalendar />
                  <SelectedDates />
              </Grid.Column>
              <Grid.Column widescreen={11} computer={10} tablet={8} mobile={12}>
                <Availability />
              </Grid.Column>
            </Grid.Row>
          </Grid>
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
