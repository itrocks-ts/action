import { ObjectOrType, Type, typeIdentifier, typeOf } from '@itrocks/class-type'

export interface ActionEntry {
	[dataKey: string]: any,
	action:   string
	css?:      string
	target:   string
	template: string
}

export const actionRepository: Record<string, Record<string, Record<symbol, ActionEntry>>> = {}

export interface ActionCss {
	[filter: string]: any
	css: string
}

export interface ActionTemplate {
	[filter: string]: any
	template: string
}

export const actionCss:       ActionCss[] = []
export const actionTemplates: ActionTemplate[] = []

const DEFAULT = Symbol('DEFAULT')

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

	const css = definition.css ?? (
		actionCss
			.filter(entry => Object.entries(definition).every(([filter, value]) => (entry[filter] === value)))
			.find(entry => Object.entries(entry).every(
				([filter, value]) => ['css', 'target'].includes(filter) || (definition[filter] === value)
			))
		?? actionCss.find(entry => Object.keys(entry).length === 1)
		?? { css: 'noMatch' }
	).css.replaceAll('(action)', targetAction)

	const template = definition.template ?? (
		actionTemplates
		.filter(entry => Object.entries(definition).every(([filter, value]) => (entry[filter] === value)))
		.find(entry => Object.entries(entry).every(
			([filter, value]) => ['target', 'template'].includes(filter) || (definition[filter] === value)
		))
		?? actionTemplates.find(entry => Object.keys(entry).length === 1)
		?? { template: 'noMatch' }
	).template

	targetActions[source ? typeIdentifier(source) : DEFAULT] = Object.assign(
		{ action: targetAction, target, css, template },
		definition
	)
}

export function setActionCss(...css: ActionCss[])
{
	actionCss.push(...css)
}

export function setActionTemplates(...templates: ActionTemplate[])
{
	actionTemplates.push(...templates)
}
