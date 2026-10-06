import EditForm from './EditForm'
import { updateSite, type Site } from '../../../apis/manager.api'

interface Props {
    site: Site
    onClose: () => void
    onSaved: (updated: Site) => void
}

export default function EditSiteForm({ site, onClose, onSaved }: Props) {
    return (
        <EditForm
            title={`Site ${site.code}`}
            fields={[
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Block', key: 'block', type: 'select', options: [1, 2, 3, 4, 5].map((b) => ({ label: `Block ${b}`, value: String(b) })) },
                { label: 'Forest', key: 'forest', type: 'select', options: [{ label: 'Dry', value: 'dry' }, { label: 'Wet', value: 'wet' }] },
                { label: 'Tenure', key: 'tenure', type: 'select', options: [{ label: 'Public', value: 'public' }, { label: 'Private', value: 'private' }] },
                { label: 'Location', key: 'location', type: 'text' },
            ]}
            initialValues={{
                name: site.name ?? '',
                block: String(site.block),
                forest: site.forest,
                tenure: site.tenure,
                location: site.location ?? '',
            }}
            onClose={onClose}
            onSave={(values) => updateSite(site.code, {
                name: values.name ? String(values.name) : null,
                block: Number(values.block),
                forest: String(values.forest),
                tenure: String(values.tenure),
                location: values.location ? String(values.location) : null,
            })}
            onSaved={onSaved}
        />
    )
}