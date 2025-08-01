import React from 'react';
import { Badge } from '@mui/material';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

function BadgeDay(props) {
  const { day, highlightedDays = [], ...other } = props;

  const isHighlighted = highlightedDays.includes(format(day, 'yyyy-MM-dd'));

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      variant="dot"
      color="primary"
      invisible={!isHighlighted} // highlightedDaysに含まれない日はバッジを非表示
    >
      <PickersDay {...other} day={day} />
    </Badge>
  );
}