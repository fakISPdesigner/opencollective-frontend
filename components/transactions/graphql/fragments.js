import { gqlV2 } from '../../../lib/graphql/helpers';

export const transactionsQueryCollectionFragment = gqlV2/* GraphQL */ `
  fragment TransactionsQueryCollectionFragment on TransactionCollection {
    totalCount
    offset
    limit
    nodes {
      id
      uuid
      amount {
        currency
        valueInCents
      }
      netAmount {
        currency
        valueInCents
      }
      platformFee {
        currency
        valueInCents
      }
      paymentProcessorFee {
        currency
        valueInCents
      }
      hostFee {
        currency
        valueInCents
      }
      type
      description
      createdAt
      isRefunded
      isRefund
      isOrderRejected
      toAccount {
        id
        name
        slug
        type
        imageUrl
        isIncognito
        settings
        ... on Individual {
          isGuest
        }
        ... on Collective {
          host {
            id
            name
            slug
            type
          }
        }
        ... on AccountWithHost {
          hostFeePercent
          platformFeePercent
        }
      }
      fromAccount {
        id
        name
        slug
        type
        imageUrl
        isIncognito
        ... on Individual {
          isGuest
        }
        ... on AccountWithHost {
          hostFeePercent
          platformFeePercent
        }
      }
      host {
        id
        name
        slug
        type
        imageUrl
      }
      giftCardEmitterAccount {
        id
        name
        slug
        type
        imageUrl
      }
      permissions {
        canRefund
        canDownloadInvoice
        canReject
      }
      paymentMethod {
        type
      }
      order {
        id
        status
      }
      expense {
        id
        status
        tags
        type
        legacyId
        comments {
          totalCount
        }
        payoutMethod {
          type
        }
        account {
          slug
        }
        createdByAccount {
          slug
        }
      }
    }
  }
`;
