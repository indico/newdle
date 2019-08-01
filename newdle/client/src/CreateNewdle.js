import React from 'react';
import {Button, Container, Grid, Icon, List, Placeholder, Segment} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {getStep} from './selectors';
import {setStep} from './actions';
import styles from './CreateNewdle.module.scss';
import Calendar from './Calendar';

export default function CreateNewdle() {
  const step = useSelector(getStep);
  const dispatch = useDispatch();
  return (
    <>
      {step === 1 && <ParticipantsPage />}
      {step === 2 && <TimeSlotsPage />}
      {step === 3 && (
        <div>
          step3
          <div className={styles['button-row']}>
            <Button color="violet" icon labelPosition="left" onClick={() => dispatch(setStep(2))}>
              Back
              <Icon name="caret left" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function ParticipantsPage() {
  const dispatch = useDispatch();
  return (
    <>
      <Container text>
        <Segment style={{minHeight: '300px'}}>
          <List>
            <List.Item>
              <List.Content floated="right">
                <Icon name="close" color="red" />
              </List.Content>
              <List.Icon name="user circle" size="large" />
              <List.Content>
                <List.Header as="a">Daniel Louise</List.Header>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Content floated="right">
                <Icon name="close" color="red" />
              </List.Content>
              <List.Icon name="user circle" size="large" />
              <List.Content>
                <List.Header as="a">Stevie Feliciano</List.Header>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Content floated="right">
                <Icon name="close" color="red" />
              </List.Content>
              <List.Icon name="user circle" size="large" />
              <List.Content>
                <List.Header as="a">Elliot Fu</List.Header>
              </List.Content>
            </List.Item>
          </List>
        </Segment>
        <div className={styles['button-row']}>
          <Button color="violet" icon labelPosition="right" size="small">
            Add participant
            <Icon name="plus" />
          </Button>
        </div>
      </Container>
      <div className={styles['button-row']}>
        <Button color="violet" icon labelPosition="right" onClick={() => dispatch(setStep(2))}>
          Skip
          <Icon name="caret right" />
        </Button>
      </div>
    </>
  );
}

function TimeSlotsPage() {
  const dispatch = useDispatch();
  return (
    <div className={styles['time-slots-grid']}>
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <Calendar />
          </Grid.Column>
          <Grid.Column width={11}>
            {/* TODO: Replace with timeline */}
            <Placeholder fluid>
              <Placeholder.Line length="full" />
              <Placeholder.Line length="very long" />
              <Placeholder.Line length="long" />
              <Placeholder.Line length="medium" />
              <Placeholder.Line length="very long" />
              <Placeholder.Line length="long" />
              <Placeholder.Line length="full" />
              <Placeholder.Line length="medium" />
              <Placeholder.Line length="very long" />
              <Placeholder.Line length="long" />
              <Placeholder.Line length="full" />
              <Placeholder.Line length="medium" />
              <Placeholder.Line length="very long" />
              <Placeholder.Line length="full" />
              <Placeholder.Line length="medium" />
              <Placeholder.Line length="long" />
            </Placeholder>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <div className={styles['button-row']}>
            <Button color="violet" icon labelPosition="left" onClick={() => dispatch(setStep(1))}>
              Back
              <Icon name="caret left" />
            </Button>
            <Button color="violet" icon labelPosition="right" onClick={() => dispatch(setStep(3))}>
              Next step
              <Icon name="caret right" />
            </Button>
          </div>
        </Grid.Row>
      </Grid>
    </div>
  );
}
