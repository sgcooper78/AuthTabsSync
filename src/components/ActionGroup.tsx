import React, { ReactNode, useState, useEffect  } from 'react'
import { Radio, Group, Loader, Tooltip } from '@mantine/core';

interface Props {
  children?: ReactNode
  name: string;
  label: string;
  description: string;
  onChange: (value: string) => void;
  value: string;
  radios: {
    id: string;
    label: string;
    name: string;
    value: string;
  }[];
}

export default function ActionGroup({ ...props }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (props.value) {
      setIsLoading(false);
    }
  }, [props.value]);

  return (
    <Radio.Group
      name={props.name}
      label={props.label}
      onChange={props.onChange}
      value={props.value}
    >
      {isLoading ? (
        <Loader size="xs" />
      ) : (
      <Group mt="xs">
        {props.radios.map((radio) => (
              <Radio name={radio.name} value={radio.value} id={radio.id} label={radio.label} />
        ))}
      </Group>
      )}
    </Radio.Group>
  );
}