import { Collection } from '@freearhey/core'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import { Octokit } from '@octokit/core'
import { IssueParser } from './'
import { TESTING, OWNER, REPO } from '../constants'

const CustomOctokit = Octokit.plugin(paginateRest, restEndpointMethods)
const octokit = new CustomOctokit()

export class IssueLoader {
  async load({ labels }: { labels: string[] | string }) {
    labels = Array.isArray(labels) ? labels.join(',') : labels
    let issues: object[] = []
    if (TESTING) {
      switch (labels) {
        case 'channels:add,approved':
          issues = (await import('../../tests/__data__/input/issues/channels_add_approved.js'))
            .default
          break
        case 'channels:edit,approved':
          issues = (await import('../../tests/__data__/input/issues/channels_edit_approved.js'))
            .default
          break
        case 'channels:remove,approved':
          issues = (await import('../../tests/__data__/input/issues/channels_remove_approved.js'))
            .default
          break
        case 'blocklist:add,approved':
          issues = (await import('../../tests/__data__/input/issues/blocklist_add_approved.js'))
            .default
          break
        case 'blocklist:remove,approved':
          issues = (await import('../../tests/__data__/input/issues/blocklist_remove_approved.js'))
            .default
          break
      }
    } else {
      issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
        owner: OWNER,
        repo: REPO,
        per_page: 100,
        labels,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
    }

    const parser = new IssueParser()

    return new Collection(issues).map(parser.parse)
  }
}
