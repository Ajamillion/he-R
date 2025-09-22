import type { ReactNode } from 'react';

type CardProps = {
  title: string;
  tag?: string;
  className?: string;
  action?: ReactNode;
  children: ReactNode;
};

export const Card = ({ title, tag, className, action, children }: CardProps) => (
  <section className={['card', className].filter(Boolean).join(' ')}>
    <header className="card__header">
      <div>
        <h2 className="card__title">{title}</h2>
        {tag ? <span className="card__tag">{tag}</span> : null}
      </div>
      {action}
    </header>
    <div>{children}</div>
  </section>
);
