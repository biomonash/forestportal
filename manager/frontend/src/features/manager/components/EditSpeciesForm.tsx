import EditForm from './EditForm'
import { updateSpecies, type Species } from '../../../apis/manager.api'

interface Props {
    species: Species
    onClose: () => void
    onSaved: (updated: Species) => void
}

export default function EditSpeciesForm({ species, onClose, onSaved }: Props) {
    return (
        <EditForm
            title={species.commonName}
            subtitle={species.scientificName}
            fields={[
                { label: 'Native', key: 'native', type: 'select', options: [{ label: 'Native', value: 'true' }, { label: 'Non-native', value: 'false' }] },
                { label: 'Taxa', key: 'taxa', type: 'select', options: [{ label: 'Bird', value: 'bird' }, { label: 'Mammal', value: 'mammal' }, { label: 'Reptile', value: 'reptile' }] },
                { label: 'Indicator', key: 'indicator', type: 'select', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
                { label: 'Reportable', key: 'reportable', type: 'select', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
                { label: 'IUCN Status', key: 'iucnStatus', type: 'text' },
            ]}
            initialValues={{
                native: species.native,
                taxa: species.taxa,
                indicator: species.indicator,
                reportable: species.reportable,
                iucnStatus: species.iucnStatus,
            }}
            onClose={onClose}
            onSave={(values) => updateSpecies(species.id, {
                native: values.native === 'true',
                taxa: String(values.taxa),
                indicator: values.indicator === 'true',
                reportable: values.reportable === 'true',
                iucnStatus: values.iucnStatus ? String(values.iucnStatus) : null,
            })}
            onSaved={onSaved}
        />
    )
}