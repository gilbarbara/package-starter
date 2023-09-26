import { render, screen } from '@testing-library/react';

import { Button } from './index';

describe('Button', () => {
  it('should render a primary button', () => {
    render(<Button>Primary</Button>);

    expect(screen.getByRole('button')).toMatchSnapshot();
  });

  it('should render a secondary button', () => {
    render(<Button variant="secondary">Secondary</Button>);

    expect(screen.getByRole('button')).toMatchSnapshot();
  });
});
