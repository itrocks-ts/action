import { ObjectOrType, Type }     from '@itrocks/class-type'
import { typeIdentifier, typeOf } from '@itrocks/class-type'
import { toDisplay, ucFirst }     from '@itrocks/rename'

export interface ActionEntry {
	[dataKey: string]: any,
	action:   string
	caption:  string
	css?:     string
	target:   string
	template: string
}

export const actionRepository: Record<string, Record<string, Record<symbol, ActionEntry>>> = {}

export interface ActionAsset {
	[filter: string]: any
	file: string
}

export const actionCss:       ActionAsset[] = []
export const actionTemplates: ActionAsset[] = []

const DEFAULT = Symbol('DEFAULT')

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
	const type = typeOf(source)
	const targetIdentifier = typeIdentifier(type)
	for (const targetAction in sourceActions) {
		const action = sourceActions[targetAction][targetIdentifier] ?? sourceActions[targetAction][DEFAULT]
		if (action) {
			action.object = source
			action.type   = type
			actions.push(action)
		}
	}
	return actions
}

export function setAction(
	sourceAction: string, targetAction: string, definition: Partial<ActionEntry> = {}, source?: Type
) {
	const sourceActions = actionRepository[sourceAction] ?? (actionRepository[sourceAction] = {})
	const target        = definition.target ?? '#'
	const targetActions = sourceActions[targetAction] ?? (sourceActions[targetAction] = {})

	const caption  = definition.caption ?? ucFirst(toDisplay(targetAction))
	const css      = definition.css ?? filterFile(actionCss, definition).file.replaceAll('(action)', targetAction)
	const template = definition.template ?? filterFile(actionTemplates, definition).file

	targetActions[source ? typeIdentifier(source) : DEFAULT] = Object.assign(
		{ action: targetAction, caption, target, css, template },
		definition
	)
}

export function setActionCss(...css: ActionAsset[])
{
	css = css.map(css => css.file.startsWith('/@') ? Object.assign(css, { file: '/node_modules' + css.file }) : css)
	actionCss.push(...css)
}

export function setActionTemplates(...templates: ActionAsset[])
{
	actionTemplates.push(...templates)
}
