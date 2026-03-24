import { Type }        from '@itrocks/class-type'
import { actionsOf }   from './actions'
import { ActionEntry } from './repository'
import { setAction }   from './repository'

export function ActionFlow(from: string, to: string, definition: Partial<ActionEntry> = {})
{
	return (source: Type) => {
		if (definition.source && (definition.source !== source)) {
			throw 'Invalid action flow definition source type'
		}
		definition.source = source
		setAction(from, to, definition)
		const actions = actionsOf(source)
		if (!actions.includes(from)) actions.push(from)
		if (!actions.includes(to))   actions.push(to)
	}
}
