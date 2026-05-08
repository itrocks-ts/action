import { ObjectOrType } from '@itrocks/class-type'
import { decorate }     from '@itrocks/decorator/class'
import { decoratorOf }  from '@itrocks/decorator/class'

const NEED = Symbol('need')

export const NOTHING = ''
type NOTHING = ''

export type Needs = NOTHING | 'object' | 'Store'
type Need = { alternative?: string, need: Needs }

export function Need(need: Needs, alternative?: string)
{
	return decorate(NEED, { alternative, need })
}

export function needOf(target: ObjectOrType)
{
	return decoratorOf<Need>(target, NEED, { need: NOTHING })
}
