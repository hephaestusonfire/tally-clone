import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {}

export function Table({ className, ...props }: TableProps) {
  return (
    <table
      className={cn(
        'w-full border-collapse text-[10px] border border-tallyTableBorder',
        className,
      )}
      {...props}
    />
  );
}

export function TableHeader(
  props: React.HTMLAttributes<HTMLTableSectionElement>,
) {
  return (
    <thead
      className={cn(
        'bg-[#E8E8E8] border-b border-tallyTableBorder',
        props.className,
      )}
      {...props}
    />
  );
}

export function TableBody(
  props: React.HTMLAttributes<HTMLTableSectionElement>,
) {
  return <tbody {...props} />;
}

export function TableRow(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'hover:bg-[#E0E0E0] border-b border-tallyTableBorder last:border-b-0',
        props.className,
      )}
      {...props}
    />
  );
}

export function TableHead(
  props: React.ThHTMLAttributes<HTMLTableCellElement>,
) {
  return (
    <th
      className={cn(
        'px-2 py-2 text-left font-semibold border-r border-tallyTableBorder last:border-r-0',
        props.className,
      )}
      {...props}
    />
  );
}

export function TableCell(
  props: React.TdHTMLAttributes<HTMLTableCellElement>,
) {
  return (
    <td
      className={cn(
        'px-2 py-2 border-r border-tallyTableBorder last:border-r-0',
        props.className,
      )}
      {...props}
    />
  );
}


