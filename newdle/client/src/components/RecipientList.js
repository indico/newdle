import React, {useState} from 'react';
import {Plural} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Label, List} from 'semantic-ui-react';
import styles from './ParticipantTable.module.scss';

const DEFAULT_RECIPIENTS_SHOWN = 10;

function ListItems({recipients, color, icon}) {
  return (
    <>
      <List>
        {recipients.map(p => {
          return (
            <List.Item key={p.id}>
              <List.Icon color={color} name={icon} />
              <List.Content>{p.name}</List.Content>
            </List.Item>
          );
        })}
      </List>
    </>
  );
}

ListItems.propTypes = {
  recipients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  color: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
};

export default function RecipientList({recipients, color, icon}) {
  const [renderAll, setRenderAll] = useState(false);

  if (renderAll || recipients.length <= DEFAULT_RECIPIENTS_SHOWN) {
    return <ListItems recipients={recipients} color={color} icon={icon} />;
  } else {
    return (
      <>
        <ListItems
          recipients={recipients.slice(0, DEFAULT_RECIPIENTS_SHOWN)}
          color={color}
          icon={icon}
        />
        <Label
          as="a"
          className={styles['more-participants']}
          color="blue"
          onClick={evt => {
            evt.stopPropagation();
            setRenderAll(true);
          }}
          circular
        >
          <Plural
            value={recipients.length - DEFAULT_RECIPIENTS_SHOWN}
            one={'+# more'}
            other={'+# more'}
          />
        </Label>
      </>
    );
  }
}

RecipientList.propTypes = {
  recipients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  color: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
};

RecipientList.defaultProps = {
  icon: 'check',
  color: 'green',
};
