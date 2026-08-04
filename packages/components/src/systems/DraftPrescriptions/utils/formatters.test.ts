import { constructRxNotes } from './formatters';

describe('constructRxNotes', () => {
  test('returns an empty string when all arguments are blank', () => {
    expect(constructRxNotes(null, null, null)).toEqual('');
    expect(constructRxNotes('', '', '')).toEqual('');
    expect(constructRxNotes('  ', '  ', '  ')).toEqual('');
  });

  test('returns just the prefill when original and override are blank', () => {
    expect(constructRxNotes(null, null, 'prefill note')).toEqual('prefill note');
    expect(constructRxNotes('', '', 'prefill note')).toEqual('prefill note');
    expect(constructRxNotes('  ', '  ', 'prefill note')).toEqual('prefill note');
  });

  test('returns just the original when override and prefill are blank', () => {
    expect(constructRxNotes('original note', null, null)).toEqual('original note');
    expect(constructRxNotes('original note', '', '')).toEqual('original note');
    expect(constructRxNotes('original note', '  ', '  ')).toEqual('original note');
  });

  test('returns just the override when original and prefill are null', () => {
    expect(constructRxNotes(null, 'override note', null)).toEqual('override note');
    expect(constructRxNotes('', 'override note', '')).toEqual('override note');
    expect(constructRxNotes('  ', 'override note', '  ')).toEqual('override note');
  });

  test('joins original and prefill with a blank line when override is blank', () => {
    expect(constructRxNotes('original note', null, 'prefill note')).toEqual(
      'original note\n\nprefill note'
    );
    expect(constructRxNotes('original note', '', 'prefill note')).toEqual(
      'original note\n\nprefill note'
    );
    expect(constructRxNotes('original note', '  ', 'prefill note')).toEqual(
      'original note\n\nprefill note'
    );
  });

  test('prefers override over original when both are provided, dropping original entirely', () => {
    expect(constructRxNotes('original note', 'override note', 'prefill note')).toEqual(
      'override note\n\nprefill note'
    );
  });

  test('falls back to original when override is an empty string', () => {
    expect(constructRxNotes('original note', '', 'prefill note')).toEqual(
      'original note\n\nprefill note'
    );
  });

  test('does not trim leading/trailing whitespace within a note', () => {
    expect(constructRxNotes(null, '  padded note  ', null)).toEqual('  padded note  ');
  });
});
