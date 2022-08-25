/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$generateNodesFromDOM} from '@lexical/html';
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {AutoScrollPlugin} from '@lexical/react/LexicalAutoScrollPlugin';
import {CharacterLimitPlugin} from '@lexical/react/LexicalCharacterLimitPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import {$getRoot} from 'lexical';
import * as React from 'react';
import {useRef, useState} from 'react';

import {createWebsocketProvider} from './collaboration';
import {useSettings} from './context/SettingsContext';
import {useSharedHistoryContext} from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import ClickableLinkPlugin from './plugins/ClickableLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CommentPlugin from './plugins/CommentPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin';
import FigmaPlugin from './plugins/FigmaPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import HorizontalRulePlugin from './plugins/HorizontalRulePlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import {MaxLengthPlugin} from './plugins/MaxLengthPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import PollPlugin from './plugins/PollPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';

const skipCollaborationInit =
  // @ts-ignore
  window.parent != null && window.parent.frames.right === window;

export default function Editor(): JSX.Element {
  const {historyState} = useSharedHistoryContext();
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
    },
  } = useSettings();
  const text = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
    ? 'Enter some rich text...'
    : 'Enter some plain text...';
  const placeholder = <Placeholder>{text}</Placeholder>;
  const scrollRef = useRef(null);
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <>
      {isRichText && <ToolbarPlugin />}
      <div
        className={`editor-container ${showTreeView ? 'tree-view' : ''} ${
          !isRichText ? 'plain-text' : ''
        }`}
        ref={scrollRef}>
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <AutoEmbedPlugin />
        <MentionsPlugin />
        <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin />
        <AutoLinkPlugin />
        <AutoScrollPlugin scrollRef={scrollRef} />
        <CommentPlugin
          providerFactory={isCollab ? createWebsocketProvider : undefined}
        />
        {isRichText ? (
          <>
            {isCollab ? (
              <CollaborationPlugin
                id="main"
                providerFactory={createWebsocketProvider}
                shouldBootstrap={!skipCollaborationInit}
              />
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )}
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={placeholder}
              // TODO Collab support until 0.4
              initialEditorState={isCollab ? null : undefined}
            />
            <MarkdownShortcutPlugin />
            <CodeHighlightPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin />
            <TableCellResizer />
            <ImagesPlugin />
            <LinkPlugin />
            <PollPlugin />
            <TwitterPlugin />
            <YouTubePlugin />
            <FigmaPlugin />
            <ClickableLinkPlugin />
            <HorizontalRulePlugin />
            <LoadHtmlPlugin />
            <EquationsPlugin />
            <ExcalidrawPlugin />
            <TabFocusPlugin />
            {floatingAnchorElem && (
              <>
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                <TableCellActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem}
                />
              </>
            )}
          </>
        ) : (
          <>
            <PlainTextPlugin
              contentEditable={<ContentEditable />}
              placeholder={placeholder}
              // TODO Collab support until 0.4
              initialEditorState={isCollab ? null : undefined}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin charset={isCharLimit ? 'UTF-16' : 'UTF-8'} />
        )}
        {isAutocomplete && <AutocompletePlugin />}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        <div className="toc">
          {showTableOfContents && <TableOfContentsPlugin />}
        </div>
        <ActionsPlugin isRichText={isRichText} />
      </div>
      {showTreeView && <TreeViewPlugin />}
    </>
  );
}

function LoadHtmlPlugin() {
  const [editor] = useLexicalComposerContext();

  editor.update(() => {
    let nodes = [];

    const html = `
    <ul data-sourcepos="1:1-5:5" style="box-sizing: border-box; margin-top: 0px; margin-bottom: 10px; color: rgb(51, 51, 51); font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">
      <li data-sourcepos="1:1-4:7" style="box-sizing: border-box;">foo<ul data-sourcepos="2:3-4:7" style="box-sizing: border-box; margin-top: 0px; margin-bottom: 0px;">
          <li data-sourcepos="2:3-3:9" style="box-sizing: border-box;">bar<ul data-sourcepos="3:5-3:9" style="box-sizing: border-box; margin-top: 0px; margin-bottom: 0px;">
              <li data-sourcepos="3:5-3:9" style="box-sizing: border-box;">baz</li>
            </ul>
          </li>
          <li data-sourcepos="4:3-4:7" style="box-sizing: border-box;">foo</li>
        </ul>
      </li>
      <li data-sourcepos="5:1-5:5" class="selected" style="box-sizing: border-box; background-color: rgb(238, 238, 238);">bar</li>
    </ul>
`;
    //   const html = `
    //   <ul class="PlaygroundEditorTheme__ul">
    //   <li value="4" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Join our </span><a href="https://discord.com/invite/KmG4wQnnD9" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Discord Server</span></a><span data-lexical-text="true"> and chat with the team.</span></li>
    //   <li value="5" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem">
    //     <ul class="PlaygroundEditorTheme__ul">
    //       <li value="1" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Hello</span></li>
    //     </ul>
    //   </li>
    // </ul>`;

    // Parse html
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, 'text/html');
    nodes = $generateNodesFromDOM(editor, dom);

    // Set content
    const root = $getRoot();
    root.clear();
    root.append(...nodes);
  });

  return null;
}
