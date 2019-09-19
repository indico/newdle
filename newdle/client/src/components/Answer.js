import _ from 'lodash';
import {Grid, Checkbox, Header} from 'semantic-ui-react';
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

function getOverlaps(candidates) {
  const sortedCandidates = _.orderBy(candidates, ['startTime'], ['asc']);

  // marks items that overlap with its successors
  let cluster_id = 0;
  const clusteredCandidates = sortedCandidates.map((candidate, index, sortedCandidates) => {
    if (
      sortedCandidates[index - 1] &&
      moment(candidate.startTime, 'HH:mm').isSameOrAfter(
        moment(sortedCandidates[index - 1].endTime, 'HH:mm')
      )
    ) {
      cluster_id += 1;
    }
    return {...candidate, cluster_id: cluster_id};
  });
  return _.chain(clusteredCandidates)
    .groupBy(cand => {
      return cand.cluster_id;
    })
    .values()
    .value();
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
    const clusteredCandidates = getOverlaps(processedCandidates);
    return {date, candidates: clusteredCandidates, busySlots: processedBusySlots};
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

function BusySlot({height, pos}) {
  return <div className={styles['busy-slot']} style={{top: `${pos}%`, height: `${height}%`}} />;
}

BusySlot.propTypes = {
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
};

function CandidateOption({startTime, endTime}) {
  return (
    <div className={styles['option']}>
      <div className={styles['times']}>
        {moment(startTime, 'H:mm').format('H:mm')} - {moment(endTime, 'H:mm').format('H:mm')}
      </div>
      <Checkbox />
    </div>
  );
}

CandidateOption.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
};

function CandidateSlot({startTime, endTime, height, pos, width = 100, left = 0}) {
  return (
    <div
      className={styles['candidate']}
      style={{top: `${pos}%`, height: `${height}%`, width: `${width - 2}%`, left: `${left}%`}}
    >
      <CandidateOption startTime={startTime} endTime={endTime} />
    </div>
  );
}

CandidateSlot.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
};

function MultipleCandidateSlot({height, pos, options}) {
  return (
    <div className={styles['candidate']} style={{top: `${pos}%`, height: `${height}%`}}>
      {options.map(option => (
        <CandidateOption {...option} />
      ))}
    </div>
  );
}

MultipleCandidateSlot.propTypes = {
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  options: PropTypes.array.isRequired,
};

function CandidateCluster(cluster) {
  cluster = cluster.cluster;
  const size = cluster.length;
  if (size < 4) {
    const width = 100 / size;
    return cluster.map((candidate, index) => (
      <CandidateSlot {...candidate} width={width} left={width * index} />
    ));
  } else {
    const height = cluster[size - 1].pos - cluster[0].pos + cluster[size - 1].height;
    const pos = cluster[0].pos;
    return <MultipleCandidateSlot height={height} pos={pos} options={cluster} />;
  }
}

CandidateCluster.propTypes = {
  cluster: PropTypes.array.isRequired,
};

function DayColumn({dayOptions}) {
  const date = moment(dayOptions.date, 'YYYY-MM-DD').format('dddd D MMM');
  return (
    <>
      <Header as="h3" className={styles['date']}>
        {date}
      </Header>
      <div className={styles['options-column']}>
        {dayOptions.busySlots.map(busySlot => (
          <BusySlot {...busySlot} />
        ))}
        {dayOptions.candidates.map(cluster => (
          <CandidateCluster cluster={cluster} />
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
  maxHour: 20,
};

export default function Answer({options}) {
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
