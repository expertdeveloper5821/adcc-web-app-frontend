export const formatToInputDate = (isoDate?: string): string =>
  isoDate ? isoDate.split("T")[0] : "";

export const formatToISODate = (date: string) =>
  new Date(date).toISOString();