import { Request }      from '@itrocks/action-request'
import { HtmlResponse } from '@itrocks/core-responses'
import { JsonResponse } from '@itrocks/core-responses'
import { Headers }      from '@itrocks/request-response'
import { ActionEntry }  from './repository'

export * from './actions'
export * from './need'
export * from './repository'

export abstract class Action
{

	actions: ActionEntry[] = []

	htmlResponse(body: string, statusCode = 200, headers: Headers = {})
	{
		return new HtmlResponse(body, statusCode, headers)
	}

	async htmlTemplateResponse(
		data: any, _request: Request, _templateFile: string, statusCode = 200, headers: Headers = {}
	) {
		return this.htmlResponse(data.toString(), statusCode, headers)
	}

	jsonResponse(data: any, statusCode = 200, headers: Headers = {})
	{
		return new JsonResponse(data, statusCode, headers)
	}

}
