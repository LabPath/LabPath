import { Temporal } from 'proposal-temporal'

const ORDINAL_INDICATOR = /(?:st|nd|rd|th)?/
const YEAR = Temporal.now.instant().toLocaleString('en-US', { year: 'numeric' })

export const TITLE_REGEX_NORMAL = new RegExp(`^Lab Path \\d{1,2}${ORDINAL_INDICATOR} \\w{3,9} ${YEAR}$`, 'i')
export const TITLE_REGEX_SUB = new RegExp(`\\w{3,9} \\d{1,2}(?:st|nd|rd|th)?, ${YEAR}$`, 'i')
export const TITLE_REGEX_DISMAL = new RegExp(`^(Dismal Maze) (?:\u2013|–|-) ${TITLE_REGEX_SUB.source}`, 'i')