import { Request }      from '@itrocks/action-request'
import { HtmlResponse } from '@itrocks/core-responses'
import { JsonResponse } from '@itrocks/core-responses'
import { Headers }      from '@itrocks/request-response'
import { ActionEntry }  from './repository'

export { Actions }                   from './actions'
export { actionsOf }                 from './actions'
export { setDefaultActions }         from './actions'
export { CLEAR }                     from './actions'
export { CLEAR as ACTION_CLEAR }     from './actions'
export { DEFAULT }                   from './actions'
export { DEFAULT as ACTION_DEFAULT } from './actions'
export { ActionFlow }                from './flow'
export { Needs }                     from './need'
export { Need }                      from './need'
export { needOf }                    from './need'
export { NOTHING }                   from './need'
export { ActionAsset }               from './repository'
export { ActionEntry }               from './repository'
export { actionRepository }          from './repository'
export { getActions  }               from './repository'
export { setAction  }                from './repository'
export { setActionCss }              from './repository'
export { setActionTemplates }        from './repository'

export abstract class Action<T extends object = object>
{

	actions: ActionEntry[] = []

	async getObject(request: Request<T>)
	{
		return await request.getObject() ?? new request.type
	}

	async getObjects(request: Request<T>)
	{
		return request.getObjects()
	}

	htmlResponse(body: string, statusCode = 200, headers: Headers = {})
	{
		return new HtmlResponse(body, statusCode, headers)
	}

	async htmlTemplateResponse(
		data: any, _request: Request<T>, _templateFile: string, statusCode = 200, headers: Headers = {}
	) {
		return this.htmlResponse(data.toString(), statusCode, headers)
	}

	jsonResponse(data: any, statusCode = 200, headers: Headers = {})
	{
		return new JsonResponse(data, statusCode, headers)
	}

}
