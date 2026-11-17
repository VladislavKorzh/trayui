import type * as React from 'react';
import type { IconName } from '../icons';

/**
 * An icon, wherever a component takes one: the name of an icon built into the system ('search', 'truck', 'circle-check': Lucide's names),
 * or any icon element, such as `<LuRocket />` from `react-icons/lu`. An element takes the size, the stroke and the colour of the system by itself.
 */
export type IconSource = IconName | React.ReactElement;
