import { PaymentMethod } from '../types';

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'usd_account',
    type: 'usd_account',
    name: 'USD Account',
    labels: ['Lowest Fee', 'Instant'],
    fee: 0,
    isInstant: true,
  },
  {
    id: 'credit_card',
    type: 'credit_card',
    name: 'Credit Card',
    labels: ['Instant'],
    fee: 2.9,
    isInstant: true,
  },
  {
    id: 'debit_card',
    type: 'debit_card',
    name: 'Debit Card',
    labels: ['Instant'],
    fee: 1.5,
    isInstant: true,
  },
  {
    id: 'skrill',
    type: 'skrill',
    name: 'Skrill',
    labels: ['Fast'],
    fee: 1.9,
    isInstant: false,
  },
  {
    id: 'neteller',
    type: 'neteller',
    name: 'Neteller',
    labels: ['Fast'],
    fee: 1.9,
    isInstant: false,
  },
];

export const getPaymentMethodById = (id: string): PaymentMethod | undefined => {
  return paymentMethods.find(method => method.id === id);
};
