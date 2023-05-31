function formatDate(dateString: string) {
  const dateParts = dateString.split(/[/\s-]/); // split the string by any of these characters: "/", " ", "-"

  if (dateParts.length !== 3) {
    return '';
  }

  const [month, day, year] = dateParts.map((part) => parseInt(part));
  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    return '';
  }

  // Check if month and day are within range
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return '';
  }

  // use template literals to format the date string
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

export default formatDate;
