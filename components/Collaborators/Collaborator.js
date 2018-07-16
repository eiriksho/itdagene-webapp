//@flow
import { createFragmentContainer, graphql } from 'react-relay';
import styled from 'styled-components';
import { ZoomImage } from '../Styled';

import React from 'react';
import ReactMarkdown from 'react-markdown';

import { type CollaboratorView_company } from './__generated__/CollaboratorView_company.graphql';

type Props = {
  company: CollaboratorView_company,
  showDescription?: boolean,
  showJoblistings?: boolean
};
const Image = styled(ZoomImage)`
  width: 270px;
  height: 200px;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 15px;
`;

const CollaboratorView = ({
  company,
  showDescription,
  showJoblistings
}: Props) => (
  <div style={{ flex: 1, maxWidth: '100%', flexBasis: 350, padding: '0 10px' }}>
    <a href={company.url}>
      <Image src={company.logo || ''} />
    </a>
    {showDescription && <ReactMarkdown source={company.description} />}
    {showJoblistings &&
      company.joblistings &&
      company.joblistings.edges.map(({ node = {} }) => (
        <>
          <a style={{ fontSize: 14 }} href="/#" key={node.id}>
            {node.title}
          </a>
          <br />
        </>
      ))}
  </div>
);

export default createFragmentContainer(
  CollaboratorView,
  graphql`
    fragment CollaboratorView_company on Company {
      id
      name
      logo(width: 378, height: 280)
      url
      description
      joblistings(first: 3) {
        edges {
          node {
            title
            id
          }
        }
      }
    }
  `
);
