/** Configuration object that fully describes a career for the UI. */
export interface CareerYearColor {
  color: string
  label: string
}

export interface CareerConfig {
  /** URL-friendly slug used in routes AND as the API endpoint segment.
   *  e.g. 'computer-engineering' maps to GET /subjects/computer-engineering */
  slug: string

  /** Human-readable title shown on the career page. */
  title: string

  /** Short description shown in the header subtitle. */
  subtitle: string

  /** Base route for this career, e.g. '/carreras/ingenieria-informatica' */
  baseRoute: string

  /** Route for the calculator page. Defaults to `${baseRoute}/calculadora` */
  calculatorRoute: string

  /** Year color legend displayed in the header. */
  yearColors: CareerYearColor[]

  /** If true, the graph groups subjects into columns per semester instead of per year. */
  groupBySemester?: boolean
}
