import _ from 'lodash';
import {Grid, Checkbox} from 'semantic-ui-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Calendar from './Calendar';
import styles from './Answer.module.scss';

const OVERFLOW_HEIGHT = 0.5;

function calculateHeight(start, end, minHour, maxHour) {
  let startMins = start.hours() * 60 + start.minutes();
  let endMins = end.hours() * 60 + end.minutes();

  if (startMins < minHour * 60) {
    startMins = minHour * 60;
  }
  if (endMins > maxHour * 60) {
    endMins = maxHour * 60;
  }
  const height = ((endMins - startMins) / ((maxHour - minHour) * 60)) * 100;
  return height > 0 ? height : OVERFLOW_HEIGHT;
}

function calculatePosition(start, minHour, maxHour) {
  const spanMins = (maxHour - minHour) * 60;
  let startMins = start.hours() * 60 + start.minutes() - minHour * 60;

  if (startMins < 0) {
    startMins = 0;
  }

  const position = (startMins / spanMins) * 100;
  return position < 100 ? position : 100 - OVERFLOW_HEIGHT;
}

function getOptionProps(startTime, endTime, minHour, maxHour) {
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
  return {
    startTime,
    endTime,
    height: calculateHeight(start, end, minHour, maxHour),
    pos: calculatePosition(start, minHour, maxHour),
    key: `${startTime}-${endTime}`,
  };
}

function calculateOptionPositions(options, minHour, maxHour) {
  return options.map(({date, candidates, busySlots}) => {
    const processedCandidates = candidates.map(candidate =>
      getOptionProps(candidate.startTime, candidate.endTime, minHour, maxHour)
    );
    const processedBusySlots = busySlots.map(busySlot =>
      getOptionProps(busySlot.startTime, busySlot.endTime, minHour, maxHour)
    );
    return {date, candidates: processedCandidates, busySlots: processedBusySlots};
  });
}

function Hours({minHour, maxHour, hourStep}) {
  const hourSeries = _.range(minHour, maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;

  return (
    <div className={styles['hours-column']}>
      {_.range(0, hourSpan + hourStep, hourStep).map((i, n) => (
        <div
          className={styles['hour']}
          key={`hour-label-${i}`}
          style={{top: `${(i / hourSpan) * 100}%`}}
        >
          {moment({hours: hourSeries[n]}).format('k')}
        </div>
      ))}
    </div>
  );
}

Hours.propTypes = {
  minHour: PropTypes.number.isRequired,
  maxHour: PropTypes.number.isRequired,
  hourStep: PropTypes.number,
};

Hours.defaultProps = {
  hourStep: 2,
};

function CandidateSlot({startTime, endTime, height, pos}) {
  return (
    <div className={styles['candidate']} style={{top: `${pos}%`, height: `${height}%`}}>
      <span className={styles['times']}>
        {moment(startTime, 'H:mm').format('H:mm')} - {moment(endTime, 'H:mm').format('H:mm')}
      </span>
    </div>
  );
}

CandidateSlot.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
};

function BusySlot({height, pos}) {
  return <div className={styles['busy-slot']} style={{top: `${pos}%`, height: `${height}%`}} />;
}

BusySlot.propTypes = {
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
};

function DayColumn({dayOptions}) {
  const date = moment(dayOptions.date, 'YYYY-MM-DD').format('dddd D MMM');
  return (
    <>
      <h3 className={styles['date']}>{date}</h3>
      <div className={styles['options-column']}>
        {dayOptions.busySlots.map(busySlot => (
          <BusySlot {...busySlot} />
        ))}
        {dayOptions.candidates.map(candidate => (
          <CandidateSlot {...candidate} />
        ))}
      </div>
    </>
  );
}

DayColumn.propTypes = {
  dayOptions: PropTypes.object.isRequired,
};

function AnswerOptions({options, minHour, maxHour}) {
  const processedOptions = calculateOptionPositions(options, minHour, maxHour);
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={1}>
          <Hours minHour={minHour} maxHour={maxHour} />
        </Grid.Column>
        <Grid.Column width={5}>
          <DayColumn dayOptions={processedOptions[0]} />
        </Grid.Column>
        <Grid.Column width={5}>
          <DayColumn dayOptions={processedOptions[1]} />
        </Grid.Column>
        <Grid.Column width={5}>
          <DayColumn dayOptions={processedOptions[2]} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

AnswerOptions.propTypes = {
  options: PropTypes.array.isRequired,
  minHour: PropTypes.number,
  maxHour: PropTypes.number,
};

AnswerOptions.defaultProps = {
  minHour: 8,
  maxHour: 18,
};

export default function Answer({options}) {
  return (
    <div>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <Calendar />
            <h3 className={styles['options-msg']}>4 out of 7 options chosen</h3>
            <Checkbox toggle label="Accept all options when I'm available" />
          </Grid.Column>
          <Grid.Column width={11}>
            <AnswerOptions options={options} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}

Answer.propTypes = {
  options: PropTypes.array.isRequired,
};
