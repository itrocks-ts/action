import { baseType }     from '@itrocks/class-type'
import { ObjectOrType } from '@itrocks/class-type'
import { Type }         from '@itrocks/class-type'
import { typeOf }       from '@itrocks/class-type'
import { toDisplay }    from '@itrocks/rename'
import { ucFirst }      from '@itrocks/rename'

const DEFAULT = Symbol('DEFAULT')

export interface ActionEntry {
	[dataKey: string]: any,
	action:   string
	caption:  string
	css?:     string
	source?:  Type
	target:   string
	template: string
}

export interface ActionAsset {
	[filter: string]: any
	file: string
}

export const actionCss: ActionAsset[] = []

export const actionRepository: Record<string, Record<string, Map<Type | typeof DEFAULT, ActionEntry>>> = {}

export const actionTemplates: ActionAsset[] = []

function filterFile(actionAssets: ActionAsset[], definition: Partial<ActionEntry>)
{
	return actionAssets
		.filter(entry => Object.entries(definition).every(
			([filter, value]) => ['file', 'target'].includes(filter) || (entry[filter] === value)
		))
		.find(entry => Object.entries(entry).every(
			([filter, value]) => ['file', 'target'].includes(filter) || (definition[filter] === value)
		))
		?? actionAssets.find(entry => Object.keys(entry).length === 1)
		?? { file: 'noMatch' }
}

export function getActions(source: ObjectOrType, sourceAction: string): ActionEntry[]
{
	const actions: ActionEntry[] = []
	const sourceActions = actionRepository[sourceAction]
	if (!sourceActions) {
		return actions
	}
	const type = baseType(typeOf(source))
	for (const targetAction in sourceActions) {
		const actionMap = sourceActions[targetAction]
		const action    = actionMap.get(type) ?? actionMap.get(DEFAULT)
		if (!action) continue
		action.object = source
		action.type   = type
		actions.push(action)
	}
	return actions
}

export function setAction(sourceAction: string, targetAction: string, definition: Partial<ActionEntry> = {})
{
	const source        = definition.source ?? DEFAULT
	const sourceActions = actionRepository[sourceAction] ?? (actionRepository[sourceAction] = {})
	const targetActions = sourceActions[targetAction]    ?? (sourceActions[targetAction] = new Map())

	targetActions.set(source, Object.assign({
		action:   targetAction,
		caption:  definition.caption  ?? ucFirst(toDisplay(targetAction)),
		css:      definition.css      ?? filterFile(actionCss, definition).file.replaceAll('(action)', targetAction),
		target:   definition.target   ?? '#',
		template: definition.template ?? filterFile(actionTemplates, definition).file
	}, definition))
}

export function setActionCss(...css: ActionAsset[])
{
	actionCss.push(...css)
}

export function setActionTemplates(...templates: ActionAsset[])
{
	actionTemplates.push(...templates)
}
