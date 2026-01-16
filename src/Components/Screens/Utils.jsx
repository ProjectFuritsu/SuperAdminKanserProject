import { Tabs } from '@mantine/core';
import { IconPhoto, IconMessageCircle, IconSettings, IconPencil, IconCategory2 } from '@tabler/icons-react';

import PublicationListType from './ListLayout/PublicationListType.jsx';
import ProvinceTable from './TablesLayout/ProvinceTable.jsx';
import CityTable from './TablesLayout/CityTable.jsx';
import BrgyTable from './TablesLayout/BrgyTable.jsx';
import PublicationAuthors from './ListLayout/PublicationAuthors.jsx';
import SupportGroupTypeTable from './TablesLayout/SupportGroupTypeTable.jsx';
import PurokTable from './TablesLayout/PurokTable.jsx';


export default function Utils() {

    return (
        <>
            <Tabs defaultValue="location">
                <Tabs.List>
                    <Tabs.Tab value="location" leftSection={<IconPhoto size={12} />}>
                        Location Management
                    </Tabs.Tab>
                    <Tabs.Tab value="types/category" leftSection={<IconMessageCircle size={12} />}>
                        Types/Category Management
                    </Tabs.Tab>
                    <Tabs.Tab value="pubs" leftSection={<IconSettings size={12} />}>
                        Publication Info Management
                    </Tabs.Tab>
                    <Tabs.Tab value="settings" leftSection={<IconSettings size={12} />}>
                        Settings
                    </Tabs.Tab>
                    <Tabs.Tab value="Others" leftSection={<IconSettings size={12} />}>
                        Settings
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="location">
                    <Tabs defaultValue="province">
                        <Tabs.List>
                            <Tabs.Tab value='province'>Province</Tabs.Tab>
                            <Tabs.Tab value='city'>City</Tabs.Tab>
                            <Tabs.Tab value='brgy'>Barangay</Tabs.Tab>
                            <Tabs.Tab value='prk'>Purok</Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value='province'>
                            <ProvinceTable />
                        </Tabs.Panel>
                        <Tabs.Panel value='city'>
                            <CityTable />
                        </Tabs.Panel>
                        <Tabs.Panel value='brgy'>
                            <BrgyTable />
                        </Tabs.Panel>
                        <Tabs.Panel value='prk'>
                            <PurokTable/>
                        </Tabs.Panel>
                    </Tabs>
                </Tabs.Panel>


                <Tabs.Panel value='types/category'>
                    <Tabs defaultValue="health">
                        <Tabs.List>
                            <Tabs.Tab value='health'>Health</Tabs.Tab>
                            <Tabs.Tab value='financial'>Financial</Tabs.Tab>
                            <Tabs.Tab value='publication'>Publications</Tabs.Tab>
                            <Tabs.Tab value='supportGroups'>Support Groups</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value='health'>
                            Comming Soon
                        </Tabs.Panel>
                        <Tabs.Panel value='financial'>
                            Comming Soon
                        </Tabs.Panel>
                        <Tabs.Panel value='publication'>
                            <PublicationListType />
                        </Tabs.Panel>
                        <Tabs.Panel value='supportGroups'>
                            <SupportGroupTypeTable />
                        </Tabs.Panel>
                    </Tabs>
                </Tabs.Panel>

                <Tabs.Panel value="pubs">
                    <Tabs defaultValue="authors">
                        <Tabs.List>
                            <Tabs.Tab value="authors" leftSection={<IconPencil size={12} />}>
                                Author of Publication
                            </Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value="authors">
                            <PublicationAuthors />
                        </Tabs.Panel>
                    </Tabs>
                </Tabs.Panel>

                <Tabs.Panel value="settings">
                    Settings tab content
                </Tabs.Panel>
            </Tabs>
        </>
    )
}
