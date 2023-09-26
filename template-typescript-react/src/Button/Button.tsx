import { CSSProperties, ReactNode, useMemo } from 'react';

import styles from './styles.module.css';

export interface ButtonProps {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
}

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', ...rest } = props;

  const style = useMemo(() => {
    const customStyles: CSSProperties = {};

    if (variant === 'secondary') {
      customStyles.backgroundColor = '#ad7bff';
      customStyles.color = '#000';
    }

    return customStyles;
  }, [variant]);

  return (
    <button className={styles.button} style={style} type="button" {...rest}>
      {children}
    </button>
  );
}
