/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {LinkNode, TOGGLE_LINK_COMMAND, toggleLink} from '@lexical/link';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  KEY_MODIFIER_COMMAND,
} from 'lexical';
import {useEffect} from 'react';
import {IS_APPLE} from 'shared/environment';

export function LinkPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([LinkNode])) {
      throw new Error('LinkPlugin: LinkNode not registered on editor');
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_LINK_COMMAND,
        (payload) => {
          if (typeof payload === 'string' || payload === null) {
            toggleLink(payload || 'https://');
          } else {
            const {url, target, rel} = payload;
            toggleLink(url, {rel, target});
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (e: KeyboardEvent) => {
          const modifierKey = IS_APPLE ? e.metaKey : e.ctrlKey;
          const key = e.key;
          console.info(e.key);

          if (modifierKey && key === 'k') {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  return null;
}
