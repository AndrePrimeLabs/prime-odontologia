class WPConsentCookieCategories {
    constructor() {
        if ( document.getElementById( 'wpconsent-modal-add-category' ) ) {
            this.addButton = document.getElementById('wpconsent-add-category');
            this.modal = new WPConsentModalForm( 'wpconsent-modal-add-category');
            this.bindEvents();
        }
    }

    bindEvents() {
        // Add new category button
        if (this.addButton) {
            this.addButton.addEventListener('click', () => this.handleAddCategory());
        }

        // Edit category buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.wpconsent-button-enabled-column .wpconsent-edit-category');
            if (button) {
                this.handleEditCategory(e);
            }
        });

        // Delete category buttons
        document.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.wpconsent-button-enabled-column .wpconsent-delete-category');
            if (deleteButton) {
                this.handleDeleteCategory(e);
            }
        });
    }

    handleAddCategory() {
        this.modal.open({
            title: 'Add New Category',
            data: {
                category_name: '',
                action: 'wpconsent_add_category'
            },
            successCallback: (response) => {
                // Add the new category to the categories list.
                if (response.success) {
                    this.addCategoryToList(response.data);
                }
                this.modal.close();
            }
        });
    }

    handleEditCategory(e) {
        const row = e.target.closest('.wpconsent-button-row');
        const categoryId = row.dataset.buttonId;
        const categoryName = row.querySelector('.wpconsent-button-label-column').textContent.trim();
        const categoryDescription = row.querySelector('.wpconsent-category-description').value.trim();

        this.modal.open({
            title: 'Edit Category',
            data: {
                category_name: categoryName,
                category_id: categoryId,
                category_description: categoryDescription,
                action: 'wpconsent_edit_category'
            },
            successCallback: (response) => {
                if (response.success) {
                    this.updateCategoryInList(response.data);
                }
                this.modal.close();
            }
        });
    }

    handleDeleteCategory(e) {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }

        const row = e.target.closest('.wpconsent-button-row');
        const categoryId = row.dataset.buttonId;

        // Send AJAX request to delete the category
        const data = new FormData();
        data.append('action', 'wpconsent_delete_category');
        data.append('category_id', categoryId);
        data.append('nonce', window.wpconsent.nonce);

        fetch(ajaxurl, {
            method: 'POST',
            body: data,
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                row.remove();
            } else {
                alert('Failed to delete category. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error deleting category:', error);
            alert('Failed to delete category. Please try again.');
        });
    }

    addCategoryToList(response) {
        const template = document.getElementById('wpconsent-new-category-row').innerHTML;
        const newRow = template.replace(/{{id}}/g, response.id).replace(/{{name}}/g, response.name).replace(/{{description}}/g, response.description);
        // Insert before the .wpconsent-actions-row
        const actionsRow = document.querySelector('.wpconsent-actions-row');
        actionsRow.insertAdjacentHTML('beforebegin', newRow);
    }

    updateCategoryInList(response) {
        const row = document.querySelector(`[data-button-id="${response.id}"]`);
        row.querySelector('.wpconsent-button-label-column').textContent = response.name;
        row.querySelector('.wpconsent-category-description').value = response.description;
    }


}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WPConsentCookieCategories();
});
