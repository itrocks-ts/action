import { ObjectOrType }   from '@itrocks/class-type'
import { Type }           from '@itrocks/class-type'
import { typeOf }         from '@itrocks/class-type'
import { decorate }       from '@itrocks/decorator/class'
import { ownDecoratorOf } from '@itrocks/decorator/class'

const ACTIONS = Symbol('actions')

export const CLEAR   = Symbol('clear')
export const DEFAULT = ['add', 'delete', 'edit', 'json', 'list', 'output', 'save', 'summary']

type ActionValue = typeof CLEAR | string | readonly string[]

let defaultActions = DEFAULT

export function Actions(...actionValues: ActionValue[])
{
	return (target: Type) => {
		const parent  = Object.getPrototypeOf(target)
		const actions = new Set((parent === Function.prototype) ? defaultActions : actionsOf(parent))
		for (const value of actionValues) {
			if (value === CLEAR) {
				actions.clear()
				continue
			}
			if (typeof value === 'string') {
				actions.add(value)
				continue
			}
			for (const valueEntry of value) {
				actions.add(valueEntry)
			}
		}
		return decorate(ACTIONS, [...actions])(target)
	}
}

export function actionsOf(target: ObjectOrType)
{
	const actions = ownDecoratorOf<string[] | undefined>(target, ACTIONS, undefined)
	if (actions) {
		return actions
	}
	Actions()(typeOf(target))
	return ownDecoratorOf<string[]>(target, ACTIONS, [])
}

export function setDefaultActions(actions: readonly string[] = DEFAULT)
{
	defaultActions = [...actions]
}
