export interface Category {
  id: number
  name: string
  description: string
}

export interface CategoryFormData {
  name: string
  description: string
}

export interface Unit {
  id: number
  name: string
  abbreviation: string
  type: 'base' | 'package'
  description: string
}

export interface UnitFormData {
  name: string
  abbreviation: string
  type: 'base' | 'package'
  description: string
}
