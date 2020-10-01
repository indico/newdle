import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {Trans, Plural} from '@lingui/macro';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {Button, Grid, Icon, Segment} from 'semantic-ui-react';
import {setStep} from '../../../actions';
import client from '../../../client';
import {getCreatedNewdle, getDuration, getFullTimeslots, getTimezone} from '../../../selectors';
import {STEPS} from '../steps';
import Availability from './Availability';
import MonthCalendar from './MonthCalendar';
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
      <Plural
        value={numSlots}
        one={
          <Trans>
            <strong>#</strong> slot selected
          </Trans>
        }
        other={
          <Trans>
            <strong>#</strong> slots selected
          </Trans>
        }
        _0="You haven't selected any slots yet"
      />
    </Segment>
  );
}

export default function TimeslotsStep({isEditing}) {
  const dispatch = useDispatch();
  const timeslots = useSelector(getFullTimeslots);
  const duration = useSelector(getDuration);
  const timezone = useSelector(getTimezone);
  const activeNewdle = useSelector(getCreatedNewdle);
  const history = useHistory();
  const [editNewdle, submitting] = client.useBackendLazy(client.editNewdle);

  async function setTimeslots() {
    const newdle = await editNewdle(activeNewdle.code, {timeslots, duration, timezone});

    if (newdle) {
      history.push(`/newdle/${activeNewdle.code}/summary`);
    }
  }

  return (
    <div>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid stackable>
            <Grid.Row columns={2}>
              <Grid.Column widescreen={5} computer={6} tablet={8} mobile={16}>
                <MonthCalendar />
                <SelectedDates />
              </Grid.Column>
              <Grid.Column widescreen={11} computer={10} tablet={8} mobile={16}>
                <Availability />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Row>
        <Grid.Row>
          <div className={styles['button-row']}>
            {!isEditing ? (
              <>
                <Button
                  color="violet"
                  icon
                  labelPosition="left"
                  onClick={() => dispatch(setStep(STEPS.PARTICIPANTS))}
                >
                  <Trans>Back</Trans>
                  <Icon name="angle left" />
                </Button>
                <Button
                  color="violet"
                  icon
                  labelPosition="right"
                  disabled={!timeslots.length}
                  onClick={() => dispatch(setStep(STEPS.FINAL))}
                >
                  <Trans>Next step</Trans>
                  <Icon name="angle right" />
                </Button>
              </>
            ) : (
              <Button color="violet" type="submit" onClick={setTimeslots} loading={submitting}>
                <Trans>Confirm</Trans>
              </Button>
            )}
          </div>
        </Grid.Row>
      </Grid>
    </div>
  );
}

TimeslotsStep.propTypes = {
  isEditing: PropTypes.bool,
};

TimeslotsStep.defaultProps = {
  isEditing: false,
};
