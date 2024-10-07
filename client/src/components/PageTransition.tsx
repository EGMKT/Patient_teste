import React from 'react';
import { CSSTransition } from 'react-transition-group';

interface PageTransitionProps {
  children: React.ReactNode;
  location: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, location }) => {
  return (
    <CSSTransition
      key={location}
      classNames="fade"
      timeout={300}
    >
      {children}
    </CSSTransition>
  );
};

export default PageTransition;
